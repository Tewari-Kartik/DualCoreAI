"""
Long-term memory: durable facts that should survive across sessions
(e.g. "the user prefers concise answers", "project X uses Postgres").

Unlike short_term's rolling buffer, these are written deliberately — the
agent decides a fact is worth keeping, calls `remember()`, and it's
retrievable by semantic similarity later via `recall()`.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional

from backend.data.embeddings import embed_text  # existing embedding integration
from backend.db.vector_store.client import get_vector_store


@dataclass
class MemoryFact:
    id: str
    session_id: str
    fact: str
    created_at: str
    score: Optional[float] = None


NAMESPACE = "long_term_memory"


def remember(session_id: str, fact: str) -> MemoryFact:
    """Embed and persist a single durable fact for this session/user."""
    vector = embed_text(fact)
    fact_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    store = get_vector_store()
    store.upsert(
        namespace=NAMESPACE,
        vectors=[
            {
                "id": fact_id,
                "values": vector,
                "metadata": {
                    "session_id": session_id,
                    "fact": fact,
                    "created_at": created_at,
                },
            }
        ],
    )

    return MemoryFact(id=fact_id, session_id=session_id, fact=fact, created_at=created_at)


def recall(session_id: str, query: str, top_k: int = 5) -> List[MemoryFact]:
    """Semantic lookup of the most relevant remembered facts for this query."""
    vector = embed_text(query)
    store = get_vector_store()

    results = store.query(
        namespace=NAMESPACE,
        vector=vector,
        top_k=top_k,
        filter={"session_id": session_id},
    )

    return [
        MemoryFact(
            id=match["id"],
            session_id=session_id,
            fact=match["metadata"]["fact"],
            created_at=match["metadata"]["created_at"],
            score=match.get("score"),
        )
        for match in results
    ]


def list_all(session_id: str, limit: int = 50) -> List[MemoryFact]:
    """Non-semantic listing — used by the Memory panel in the UI."""
    store = get_vector_store()
    records = store.list(namespace=NAMESPACE, filter={"session_id": session_id}, limit=limit)

    return [
        MemoryFact(
            id=r["id"],
            session_id=session_id,
            fact=r["metadata"]["fact"],
            created_at=r["metadata"]["created_at"],
        )
        for r in records
    ]


def forget(fact_id: str) -> None:
    store = get_vector_store()
    store.delete(namespace=NAMESPACE, ids=[fact_id])
