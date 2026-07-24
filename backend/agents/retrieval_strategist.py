"""
Retrieval Strategist Agent
Handles all document retrieval logic: vector search, BM25 search, and hybrid RRF fusion.
Extracted from the inline logic in chat.py into a proper agent module.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Dict, Any

from core.traditional_rag import retrieve_documents
from core.vectorless_rag import retrieve_documents_vectorless
from core.reranker import reciprocal_rank_fusion


@dataclass
class RetrievalResult:
    sources: List[Dict[str, Any]]
    method: str          # "traditional", "vectorless", or "hybrid"
    query_used: str


def retrieve(query: str, mode: str = "auto", top_k: int = 3) -> RetrievalResult:
    """
    Execute the appropriate retrieval strategy based on the requested mode.
    
    Args:
        query: The optimized search query (from Query Analyst).
        mode: One of "auto" (hybrid), "traditional" (vector), "vectorless" (BM25).
        top_k: Number of top documents to return.
    
    Returns:
        RetrievalResult with sources and the method used.
    """
    if mode == "vectorless":
        sources = retrieve_documents_vectorless(query, top_k=top_k)
        method = "vectorless"

    elif mode == "traditional":
        sources = retrieve_documents(query, top_k=top_k)
        method = "traditional"

    else:  # "auto" → hybrid fusion
        vector_src = retrieve_documents(query, top_k=5)
        keyword_src = retrieve_documents_vectorless(query, top_k=5)
        sources = reciprocal_rank_fusion(vector_src, keyword_src, top_k=top_k)
        method = "hybrid"

    return RetrievalResult(sources=sources, method=method, query_used=query)
