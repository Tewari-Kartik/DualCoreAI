import os
import json
import time
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
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
from api.events import AgentEventCollector, store_agent_log

groq_api_key = os.environ.get("GROQ_API_KEY")
tavily_api_key = os.environ.get("TAVILY_API_KEY")

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


def _run_agentic_pipeline(req: ChatRequest, collector: AgentEventCollector):
    """Core agentic pipeline that emits events at each step. Returns (answer, sources, mode, loops, confidence)."""

    if req.session_id not in chat_histories:
        chat_histories[req.session_id] = []

    # 1. THINKING
    collector.thinking("Analyzing your question...")

    # 2. AGENTIC STEP: Rewrite query
    search_query = rewrite_query(req.message, chat_histories[req.session_id])
    collector.rewriting(original=req.message, optimized=search_query)

    # 3. DYNAMIC ROUTING WITH HYBRID FUSION
    if req.mode == "vectorless":
        collector.searching(mode="vectorless", message="Running BM25 lexical search...")
        real_sources = retrieve_documents_vectorless(search_query, top_k=3)
        mode_used = "vectorless"
    elif req.mode == "traditional":
        collector.searching(mode="traditional", message="Running dense vector search...")
        real_sources = retrieve_documents(search_query, top_k=3)
        mode_used = "traditional"
    else:
        collector.searching(mode="hybrid", message="Running dual retrieval (vector + BM25)...")
        vector_src = retrieve_documents(search_query, top_k=5)
        keyword_src = retrieve_documents_vectorless(search_query, top_k=5)
        real_sources = reciprocal_rank_fusion(vector_src, keyword_src, top_k=3)
        mode_used = "hybrid"

    collector.sources_found(real_sources, method=mode_used)

    context_text = "\n\n".join([f"Document ({doc['source_file']}):\n{doc['content']}" for doc in real_sources])

    # 4. CONSTRUCT MESSAGE PACK
    messages = [
        SystemMessage(content=f"""You are a helpful, intelligent assistant. 
        Answer the user's latest question using the retrieved document chunks provided below.
        If the answer cannot be found in the context, DO NOT attempt to guess. Instead, reply EXACTLY with the phrase "TRIGGER_WEB_SEARCH".
        
        CURRENT RETRIEVED CONTEXT:
        {context_text}""")
    ]
    messages.extend(chat_histories[req.session_id][-10:])
    messages.append(HumanMessage(content=req.message))

    # 5. AGENTIC STEP: Self-Reflection Loop
    collector.generating("Generating answer with LLM...")

    max_retries = 1
    reflection_loops = 0
    is_good_answer = False
    final_answer = ""

    while reflection_loops < max_retries and not is_good_answer:
        ai_response = llm.invoke(messages)
        final_answer = ai_response.content

        lower_ans = final_answer.lower()
        if "trigger_web_search" in lower_ans or "i don't have" in lower_ans or "not provided" in lower_ans or "not mentioned" in lower_ans:
            collector.reflecting(passed=False, loop=reflection_loops, feedback="Answer not found in documents")
            is_good_answer = False
            final_answer = "TRIGGER_WEB_SEARCH"
            break

        if not real_sources:
            is_good_answer = True
            collector.reflecting(passed=True, loop=reflection_loops, feedback="No sources to validate against")
            break

        is_good_answer = check_hallucination_and_relevance(
            question=req.message,
            context=context_text,
            answer=final_answer
        )

        if is_good_answer:
            collector.reflecting(passed=True, loop=reflection_loops, feedback="Answer is grounded and relevant")
        else:
            reflection_loops += 1
            collector.reflecting(passed=False, loop=reflection_loops, feedback="Hallucination or irrelevance detected")
            collector.improving(loop=reflection_loops, message=f"Re-generating answer (attempt {reflection_loops + 1})...")
            messages.append(SystemMessage(content="CRITICAL FEEDBACK: Your previous response was flagged as either irrelevant or an ungrounded hallucination. Correct any factual mistakes and reply strictly utilizing the context chunks."))

    # 6. WEB SEARCH FALLBACK
    if not is_good_answer or "TRIGGER_WEB_SEARCH" in final_answer:
        collector.web_search(query=search_query, message="Answer not found locally. Searching the web via Tavily...")

        search_tool = TavilySearchResults(max_results=3)

        try:
            web_results = search_tool.invoke(search_query)

            web_messages = [
                SystemMessage(content=f"""You are a helpful, intelligent assistant. 
                The user's question could not be answered using their private documents. 
                Please answer their question using ONLY the live web search results provided below.
                Include a brief note indicating that this information was pulled from the live web.
                
                LIVE WEB RESULTS:
                {web_results}"""),
                HumanMessage(content=req.message)
            ]

            ai_response = llm.invoke(web_messages)
            final_answer = ai_response.content
            mode_used = f"{mode_used} + tavily_search"

        except Exception as e:
            collector.error(message=f"Web search failed: {str(e)}")
            final_answer = "I'm sorry, I couldn't find the answer in your documents, and the live web search also failed."

    # 7. WRITE TURNS TO SESSION MEMORY
    chat_histories[req.session_id].append(HumanMessage(content=req.message))
    chat_histories[req.session_id].append(AIMessage(content=final_answer))

    # Smart confidence scoring
    if is_good_answer:
        confidence = 0.95
    elif "tavily_search" in mode_used:
        confidence = 0.78  # web search found an answer
    elif reflection_loops > 0:
        confidence = 0.65  # had to re-generate but got something
    else:
        confidence = 0.50

    collector.done(
        answer=final_answer,
        mode_used=mode_used,
        confidence=confidence,
        reflection_loops=reflection_loops,
        tokens_used=150
    )

    return final_answer, real_sources, mode_used, reflection_loops, confidence


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    """Original JSON endpoint — kept for backward compatibility."""
    collector = AgentEventCollector(req.session_id)
    final_answer, real_sources, mode_used, reflection_loops, confidence = _run_agentic_pipeline(req, collector)
    store_agent_log(req.session_id, collector.to_log_entry())

    return ChatResponse(
        session_id=req.session_id,
        answer=final_answer,
        sources=real_sources,
        rag_mode_used=mode_used,
        reflection_loops=reflection_loops,
        confidence=confidence,
        tokens_used=150
    )


@router.post("/chat/stream")
async def chat_stream_endpoint(req: ChatRequest):
    """SSE streaming endpoint — emits agent events in real-time."""
    
    def event_generator():
        collector = AgentEventCollector(req.session_id)
        
        try:
            # We run the pipeline and collect events, then stream them
            # For true real-time streaming, each step yields immediately
            if req.session_id not in chat_histories:
                chat_histories[req.session_id] = []

            # Step 1: Thinking
            yield collector.thinking("Analyzing your question...").to_sse()

            # Step 2: Query rewriting
            search_query = rewrite_query(req.message, chat_histories[req.session_id])
            yield collector.rewriting(original=req.message, optimized=search_query).to_sse()

            # Step 3: Retrieval
            if req.mode == "vectorless":
                yield collector.searching(mode="vectorless", message="Running BM25 lexical search...").to_sse()
                real_sources = retrieve_documents_vectorless(search_query, top_k=3)
                mode_used = "vectorless"
            elif req.mode == "traditional":
                yield collector.searching(mode="traditional", message="Running dense vector search...").to_sse()
                real_sources = retrieve_documents(search_query, top_k=3)
                mode_used = "traditional"
            else:
                yield collector.searching(mode="hybrid", message="Running dual retrieval (vector + BM25)...").to_sse()
                vector_src = retrieve_documents(search_query, top_k=5)
                keyword_src = retrieve_documents_vectorless(search_query, top_k=5)
                real_sources = reciprocal_rank_fusion(vector_src, keyword_src, top_k=3)
                mode_used = "hybrid"

            yield collector.sources_found(real_sources, method=mode_used).to_sse()

            context_text = "\n\n".join([f"Document ({doc['source_file']}):\n{doc['content']}" for doc in real_sources])

            messages = [
                SystemMessage(content=f"""You are a helpful, intelligent assistant. 
                Answer the user's latest question using the retrieved document chunks provided below.
                If the answer cannot be found in the context, DO NOT attempt to guess. Instead, reply EXACTLY with the phrase "TRIGGER_WEB_SEARCH".
                
                CURRENT RETRIEVED CONTEXT:
                {context_text}""")
            ]
            messages.extend(chat_histories[req.session_id][-10:])
            messages.append(HumanMessage(content=req.message))

            # Step 4: Generation + reflection loop
            yield collector.generating("Generating answer with LLM...").to_sse()

            max_retries = 1
            reflection_loops = 0
            is_good_answer = False
            final_answer = ""

            while reflection_loops < max_retries and not is_good_answer:
                ai_response = llm.invoke(messages)
                final_answer = ai_response.content

                lower_ans = final_answer.lower()
                if "trigger_web_search" in lower_ans or "i don't have" in lower_ans or "not provided" in lower_ans or "not mentioned" in lower_ans:
                    yield collector.reflecting(passed=False, loop=reflection_loops, feedback="Answer not found in documents").to_sse()
                    is_good_answer = False
                    final_answer = "TRIGGER_WEB_SEARCH"
                    break

                if not real_sources:
                    is_good_answer = True
                    yield collector.reflecting(passed=True, loop=reflection_loops, feedback="No sources to validate against").to_sse()
                    break

                is_good_answer = check_hallucination_and_relevance(
                    question=req.message, context=context_text, answer=final_answer
                )

                if is_good_answer:
                    yield collector.reflecting(passed=True, loop=reflection_loops, feedback="Answer is grounded and relevant").to_sse()
                else:
                    reflection_loops += 1
                    yield collector.reflecting(passed=False, loop=reflection_loops, feedback="Hallucination or irrelevance detected").to_sse()
                    yield collector.improving(loop=reflection_loops, message=f"Re-generating answer (attempt {reflection_loops + 1})...").to_sse()
                    messages.append(SystemMessage(content="CRITICAL FEEDBACK: Your previous response was flagged as either irrelevant or an ungrounded hallucination. Correct any factual mistakes and reply strictly utilizing the context chunks."))

            # Step 5: Web search fallback
            if not is_good_answer or "TRIGGER_WEB_SEARCH" in final_answer:
                yield collector.web_search(query=search_query, message="Searching the web via Tavily...").to_sse()
                search_tool = TavilySearchResults(max_results=3)
                try:
                    web_results = search_tool.invoke(search_query)
                    web_messages = [
                        SystemMessage(content=f"""You are a helpful, intelligent assistant. 
                        The user's question could not be answered using their private documents. 
                        Please answer their question using ONLY the live web search results provided below.
                        Include a brief note indicating that this information was pulled from the live web.
                        LIVE WEB RESULTS:
                        {web_results}"""),
                        HumanMessage(content=req.message)
                    ]
                    ai_response = llm.invoke(web_messages)
                    final_answer = ai_response.content
                    mode_used = f"{mode_used} + tavily_search"
                except Exception as e:
                    yield collector.error(message=f"Web search failed: {str(e)}").to_sse()
                    final_answer = "I'm sorry, I couldn't find the answer in your documents, and the live web search also failed."

            # Step 6: Memory
            chat_histories[req.session_id].append(HumanMessage(content=req.message))
            chat_histories[req.session_id].append(AIMessage(content=final_answer))

            # Smart confidence scoring
            if is_good_answer:
                confidence = 0.95
            elif "tavily_search" in mode_used:
                confidence = 0.78
            elif reflection_loops > 0:
                confidence = 0.65
            else:
                confidence = 0.50

            yield collector.done(
                answer=final_answer, mode_used=mode_used,
                confidence=confidence, reflection_loops=reflection_loops,
                tokens_used=150
            ).to_sse()

            store_agent_log(req.session_id, collector.to_log_entry())

        except Exception as e:
            yield collector.error(message=str(e)).to_sse()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )