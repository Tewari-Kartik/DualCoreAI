"""
Routes backing the frontend's MemoryPanel: session chat history (short-term)
and durable facts (long-term). Kept thin — all real logic lives in
backend/memory/short_term.py and backend/memory/long_term.py.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from backend.api.dependencies import get_current_user
from backend.api.schemas.memory import (
    MemoryFactOut,
    MemoryHistoryOut,
    RememberFactIn,
)
from backend.memory import long_term, short_term

router = APIRouter(prefix="/memory", tags=["memory"])


@router.get("/{session_id}", response_model=MemoryHistoryOut)
def get_memory(session_id: str, _user: str = Depends(get_current_user)):
    """Long-term facts shown in the Memory panel (not the raw chat log)."""
    facts = long_term.list_all(session_id)
    return MemoryHistoryOut(
        session_id=session_id,
        facts=[MemoryFactOut(id=f.id, fact=f.fact, createdAt=f.created_at) for f in facts],
    )


@router.get("/{session_id}/history")
def get_short_term_history(session_id: str, _user: str = Depends(get_current_user)):
    """Raw rolling conversation buffer — used to rehydrate a chat on reload."""
    store = short_term.get_short_term_memory()
    return {"session_id": session_id, "messages": store.get_history(session_id)}


@router.post("/{session_id}", response_model=MemoryFactOut)
def save_fact(session_id: str, body: RememberFactIn, _user: str = Depends(get_current_user)):
    """Explicitly persist a fact — called by the agent when it decides something is worth keeping."""
    if not body.fact.strip():
        raise HTTPException(status_code=400, detail="Fact cannot be empty.")

    saved = long_term.remember(session_id, body.fact.strip())
    return MemoryFactOut(id=saved.id, fact=saved.fact, createdAt=saved.created_at)


@router.delete("/{session_id}")
def clear_session(session_id: str, _user: str = Depends(get_current_user)):
    """Clears the short-term buffer only — long-term facts persist deliberately and need explicit deletion."""
    store = short_term.get_short_term_memory()
    store.clear(session_id)
    return {"session_id": session_id, "cleared": True}
