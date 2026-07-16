"""
Hybrid search: runs lexical (BM25) and semantic (vector) retrieval in
parallel, then fuses the two ranked lists with Reciprocal Rank Fusion (RRF).

This is the engine behind the homepage's "two engines, one answer" pitch —
keep the fusion logic here in sync with that story if either changes.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from rank_bm25 import BM25Okapi

from backend.data.embeddings import embed_text
from backend.db.vector_store.client import get_vector_store

RRF_K = 60  # standard RRF smoothing constant; higher = flatter weighting of rank position


@dataclass
class RetrievedChunk:
    id: str
    content: str
    source_file: str
    lexical_rank: int | None = None
    semantic_rank: int | None = None
    fused_score: float = 0.0


def _tokenize(text: str) -> List[str]:
    return text.lower().split()


def lexical_search(query: str, corpus: List[dict], top_k: int) -> List[str]:
    """
    corpus: list of {"id": str, "content": str} — the current document set.
    Returns chunk ids ranked by BM25 score, best first.
    """
    if not corpus:
        return []

    tokenized_corpus = [_tokenize(doc["content"]) for doc in corpus]
    bm25 = BM25Okapi(tokenized_corpus)
    scores = bm25.get_scores(_tokenize(query))

    ranked = sorted(zip(corpus, scores), key=lambda pair: pair[1], reverse=True)
    return [doc["id"] for doc, _ in ranked[:top_k]]


def semantic_search(query: str, top_k: int) -> List[str]:
    """Vector similarity search via the configured vector store client."""
    vector = embed_text(query)
    store = get_vector_store()
    results = store.query(namespace="documents", vector=vector, top_k=top_k)
    return [match["id"] for match in results]


def reciprocal_rank_fusion(ranked_lists: List[List[str]], k: int = RRF_K) -> List[str]:
    """
    Standard RRF: score(doc) = sum(1 / (k + rank)) across every list it
    appears in. Rewards documents that rank well in *either* signal, and
    especially those that rank well in both.
    """
    scores: Dict[str, float] = {}
    for ranked_list in ranked_lists:
        for rank, doc_id in enumerate(ranked_list):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank + 1)

    return [doc_id for doc_id, _ in sorted(scores.items(), key=lambda pair: pair[1], reverse=True)]


def hybrid_search(
    query: str,
    corpus: List[dict],
    top_k: int = 8,
    candidate_k: int = 30,
) -> List[RetrievedChunk]:
    """
    Full pipeline: retrieve top `candidate_k` from each strategy, fuse with
    RRF, then return the top `top_k` fully-hydrated chunks.
    """
    lexical_ids = lexical_search(query, corpus, candidate_k)
    semantic_ids = semantic_search(query, candidate_k)

    fused_ids = reciprocal_rank_fusion([lexical_ids, semantic_ids])[:top_k]

    by_id = {doc["id"]: doc for doc in corpus}
    lexical_rank_map = {doc_id: rank for rank, doc_id in enumerate(lexical_ids)}
    semantic_rank_map = {doc_id: rank for rank, doc_id in enumerate(semantic_ids)}

    chunks: List[RetrievedChunk] = []
    for doc_id in fused_ids:
        doc = by_id.get(doc_id)
        if not doc:
            continue  # semantic hit not present in the passed-in corpus slice
        chunks.append(
            RetrievedChunk(
                id=doc_id,
                content=doc["content"],
                source_file=doc.get("source_file", "unknown"),
                lexical_rank=lexical_rank_map.get(doc_id),
                semantic_rank=semantic_rank_map.get(doc_id),
            )
        )

    return chunks
