import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from core.traditional_rag import retrieve_documents
from core.vectorless_rag import retrieve_documents_vectorless
from core.reranker import reciprocal_rank_fusion
from agents.query_rewriter import rewrite_query
from agents.self_reflection import check_hallucination_and_relevance
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_community.tools.tavily_search import TavilySearchResults

# Import for Autonomous Web Search
from langchain_community.tools import DuckDuckGoSearchRun

# IMPORTANT: Paste your actual Groq API key here
os.environ["GROQ_API_KEY"] = "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"
os.environ["TAVILY_API_KEY"] = "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"

router = APIRouter()

# --- In-Memory Conversation Storage ---
chat_histories = {}

# --- Schemas ---
class ChatRequest(BaseModel):
    session_id: str
    message: str
    mode: Optional[str] = "auto"

class Source(BaseModel):
    id: str
    content: str
    source_file: str
    score: float
    retrieval_method: str

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sources: List[Source]
    rag_mode_used: str
    reflection_loops: int
    confidence: float
    tokens_used: int

# --- The Brain ---
llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.2)

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    print(f"\n--- New Request: Session {req.session_id} ---")
    
    if req.session_id not in chat_histories:
        chat_histories[req.session_id] = []
        
    # 1. AGENTIC STEP: Rewrite query using conversation history context
    search_query = rewrite_query(req.message, chat_histories[req.session_id])
    
    # 2. DYNAMIC ROUTING WITH HYBRID FUSION
    if req.mode == "vectorless":
        real_sources = retrieve_documents_vectorless(search_query, top_k=3)
        mode_used = "vectorless"
    elif req.mode == "traditional":
        real_sources = retrieve_documents(search_query, top_k=3)
        mode_used = "traditional"
    else:
        # 'auto' or default mode running full Hybrid Search!
        print("Running Hybrid Search Execution (Dense + Sparse)...")
        vector_src = retrieve_documents(search_query, top_k=5)
        keyword_src = retrieve_documents_vectorless(search_query, top_k=5)
        real_sources = reciprocal_rank_fusion(vector_src, keyword_src, top_k=3)
        mode_used = "hybrid"
    
    context_text = "\n\n".join([f"Document ({doc['source_file']}):\n{doc['content']}" for doc in real_sources])
    
    # 3. CONSTRUCT MESSAGE PACK
    messages = [
        SystemMessage(content=f"""You are a helpful, intelligent assistant. 
        Answer the user's latest question using the retrieved document chunks provided below.
        If the answer cannot be found in the context, DO NOT attempt to guess. Instead, reply EXACTLY with the phrase "TRIGGER_WEB_SEARCH".
        
        CURRENT RETRIEVED CONTEXT:
        {context_text}""")
    ]
    
    # Inject conversational history window
    messages.extend(chat_histories[req.session_id][-10:])
    messages.append(HumanMessage(content=req.message))
    
    # 4. AGENTIC STEP: Self-Reflection Output Supervision Loop
    max_retries = 2
    reflection_loops = 0
    is_good_answer = False
    final_answer = ""
    
    print("Generating response...")
    while reflection_loops < max_retries and not is_good_answer:
        ai_response = llm.invoke(messages)
        final_answer = ai_response.content
        
        # --- UPGRADED: Catch the secret trigger AND polite refusals ---
        lower_ans = final_answer.lower()
        if "trigger_web_search" in lower_ans or "i don't have" in lower_ans or "not provided" in lower_ans or "not mentioned" in lower_ans:
            print("AI doesn't know the answer. Bypassing local reflection to trigger Web Search...")
            is_good_answer = False
            final_answer = "TRIGGER_WEB_SEARCH" # Force the trigger for the fallback block
            break 
        # --------------------------------------------------------------
        
        if not real_sources:
            is_good_answer = True
            break
            
        is_good_answer = check_hallucination_and_relevance(
            question=req.message,
            context=context_text,
            answer=final_answer
        )
        
        if not is_good_answer:
            print(f"Answer failed validation check. Iterating loop {reflection_loops + 1}...")
            reflection_loops += 1
            messages.append(SystemMessage(content="CRITICAL FEEDBACK: Your previous response was flagged as either irrelevant or an ungrounded hallucination. Correct any factual mistakes and reply strictly utilizing the context chunks."))
            
    # 5. --- AUTONOMOUS WEB SEARCH FALLBACK ---
    # 5. --- AUTONOMOUS WEB SEARCH FALLBACK ---
    if not is_good_answer or "TRIGGER_WEB_SEARCH" in final_answer:
        print("Answer not found locally. Triggering Tavily Live Web Search...")
        
        # Initialize Tavily instead of DuckDuckGo
        search_tool = TavilySearchResults(max_results=3) 
        
        try:
            # Search the live web using the optimized search query
            web_results = search_tool.invoke(search_query)
            
            # Re-prompt the LLM using the web results
            web_messages = [
                SystemMessage(content=f"""You are a helpful, intelligent assistant. 
                The user's question could not be answered using their private documents. 
                Please answer their question using ONLY the live web search results provided below.
                Include a brief note indicating that this information was pulled from the live web.
                
                LIVE WEB RESULTS:
                {web_results}"""),
                HumanMessage(content=req.message)
            ]
            
            print("Reading Tavily web results...")
            ai_response = llm.invoke(web_messages)
            final_answer = ai_response.content
            
            mode_used = f"{mode_used} + tavily_search"
            
        except Exception as e:
            print(f"Web search failed: {e}")
            final_answer = "I'm sorry, I couldn't find the answer in your documents, and the live web search also failed."
    # -----------------------------------------
    # -----------------------------------------
        
    # 6. WRITE TURNS TO SESSION MEMORY
    chat_histories[req.session_id].append(HumanMessage(content=req.message))
    chat_histories[req.session_id].append(AIMessage(content=final_answer))
    
    print(f"Workflow Complete. Method used: {mode_used} | Loops: {reflection_loops}")
    
    return ChatResponse(
        session_id=req.session_id,
        answer=final_answer,
        sources=real_sources,
        rag_mode_used=mode_used, 
        reflection_loops=reflection_loops,
        confidence=0.95 if is_good_answer else 0.40,
        tokens_used=150
    )