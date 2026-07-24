"""
Chat API Routes
Now delegates the entire agentic pipeline to the Orchestrator Agent.
Supports both standard JSON response and real-time SSE streaming.
"""

import os
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional

from agents.orchestrator import orchestrate_stream, OrchestratorResult
from agents.base import AGENTS, get_agent_info
from api.events import AgentEventCollector, store_agent_log

router = APIRouter()


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


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    """Standard JSON endpoint — runs the orchestrator and returns the final result."""
    collector = AgentEventCollector(req.session_id)

    # Consume the generator to completion, collecting the result
    gen = orchestrate_stream(req.session_id, req.message, req.mode, collector)
    result = None
    try:
        while True:
            next(gen)
    except StopIteration as e:
        result = e.value

    store_agent_log(req.session_id, collector.to_log_entry())

    return ChatResponse(
        session_id=req.session_id,
        answer=result.answer,
        sources=result.sources,
        rag_mode_used=result.mode_used,
        reflection_loops=result.reflection_loops,
        confidence=result.confidence,
        tokens_used=150,
    )


@router.post("/chat/stream")
async def chat_stream_endpoint(req: ChatRequest):
    """SSE streaming endpoint — emits agent events in real-time."""

    def event_generator():
        collector = AgentEventCollector(req.session_id)

        try:
            gen = orchestrate_stream(req.session_id, req.message, req.mode, collector)

            # Yield each SSE event as the orchestrator produces it
            try:
                while True:
                    event = next(gen)
                    yield event.to_sse()
            except StopIteration:
                pass

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
        },
    )


@router.get("/agents/registry")
async def get_agent_registry():
    """Returns the full agent registry for the frontend to render agent cards."""
    return {
        "agents": [
            {
                "key": key,
                **get_agent_info(key),
                "description": _AGENT_DESCRIPTIONS.get(key, ""),
            }
            for key in AGENTS
        ]
    }


_AGENT_DESCRIPTIONS = {
    "orchestrator": "The central brain that coordinates all agents. Classifies query intent, builds execution plans, delegates tasks, and handles dynamic re-routing when validation fails.",
    "query_analyst": "Analyzes conversation context and rewrites ambiguous queries into optimized, standalone search terms for maximum retrieval accuracy.",
    "retrieval_strategist": "Executes the retrieval strategy — dense vector search, BM25 lexical search, or hybrid Reciprocal Rank Fusion — to fetch the most relevant document chunks.",
    "synthesis": "Crafts the final answer by reasoning over retrieved context using the LLM. Handles multi-turn conversations and context window management.",
    "critic": "Evaluates generated answers for hallucination, relevance, and factual grounding. Can trigger re-generation when quality standards aren't met.",
    "web_researcher": "Fallback agent that searches the live web via Tavily when local documents lack coverage. Synthesizes answers from web results.",
}