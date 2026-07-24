"""
Web Research Agent
Handles live web search fallback via Tavily when local documents lack coverage.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List, Any

from langchain_community.tools.tavily_search import TavilySearchResults

from agents.synthesis import synthesize_from_web


@dataclass
class WebSearchResult:
    answer: str
    raw_results: Any
    success: bool
    error: Optional[str] = None


from typing import Optional


def search_and_answer(query: str, question: str, max_results: int = 3) -> WebSearchResult:
    """
    Search the live web via Tavily and generate an answer from web results.
    
    Args:
        query: The optimized search query.
        question: The original user question.
        max_results: Number of Tavily results to retrieve.
    
    Returns:
        WebSearchResult with the generated answer and raw results.
    """
    try:
        search_tool = TavilySearchResults(max_results=max_results)
        web_results = search_tool.invoke(query)

        answer = synthesize_from_web(question, str(web_results))

        return WebSearchResult(
            answer=answer,
            raw_results=web_results,
            success=True,
        )

    except Exception as e:
        return WebSearchResult(
            answer="I'm sorry, I couldn't find the answer in your documents, and the live web search also failed.",
            raw_results=None,
            success=False,
            error=str(e),
        )
