"""
Query Analyst Agent (evolved from query_rewriter)
Analyzes and rewrites user queries using conversation context.
Returns a structured QueryAnalysisResult with the optimized query.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage




@dataclass
class QueryAnalysisResult:
    original: str
    optimized: str
    is_rewritten: bool   # False when history is empty (no rewrite needed)


def rewrite_query(current_message: str, chat_history: list) -> str:
    """Legacy interface — kept for backward compatibility."""
    result = analyze_query(current_message, chat_history)
    return result.optimized


def analyze_query(current_message: str, chat_history: list) -> QueryAnalysisResult:
    """
    Analyze the user query in conversation context and produce an optimized
    standalone search query for document retrieval.
    
    Args:
        current_message: The latest user message.
        chat_history: Recent conversation turns (LangChain message objects).
    
    Returns:
        QueryAnalysisResult with original and optimized queries.
    """
    if not chat_history:
        return QueryAnalysisResult(
            original=current_message,
            optimized=current_message,
            is_rewritten=False,
        )

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

    print("  [Query Analyst] Rewriting query based on conversation context...")
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)
    response = llm.invoke([HumanMessage(content=prompt)])
    optimized_query = response.content.strip()
    print(f"  [Query Analyst] Optimized: '{optimized_query}'")

    return QueryAnalysisResult(
        original=current_message,
        optimized=optimized_query,
        is_rewritten=True,
    )