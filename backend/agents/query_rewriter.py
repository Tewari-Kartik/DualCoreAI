from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

def rewrite_query(current_message: str, chat_history: list) -> str:
    """
    Analyzes conversation history and the latest message to craft an optimized,
    standalone search query. Bypasses history if the message is already standalone.
    """
    if not chat_history:
        return current_message
        
    rewriter_llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)
    
    # Format history into a readable string for the model
    history_str = ""
    for msg in chat_history[-4:]:  # Look at the last 4 turns for context
        role = "User" if msg.__class__.__name__ == "HumanMessage" else "Assistant"
        history_str += f"{role}: {msg.content}\n"
        
    prompt = f"""You are an expert search query optimizer. Given the following conversation history and a new user message, rewrite the message into a standalone, concise keyword search query optimized for a document database.
    
    CONVERSATION HISTORY:
    {history_str}
    
    LATEST USER MESSAGE:
    {current_message}
    
    Output ONLY the optimized search query. Do not include introductory text, quotes, or explanations.
    """
    
    print("Rewriting query based on conversation context...")
    response = rewriter_llm.invoke([HumanMessage(content=prompt)])
    optimized_query = response.content.strip()
    print(f"Optimized Query: '{optimized_query}'")
    return optimized_query