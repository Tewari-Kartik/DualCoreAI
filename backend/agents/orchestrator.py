"""
Orchestrator Agent — The Central Brain
Coordinates all specialized agents, builds execution plans, and handles
dynamic re-routing when an agent fails (e.g., Critic rejects → re-synthesize).

This replaces the inline pipeline that was previously in chat.py.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Generator

from langchain_core.messages import HumanMessage, AIMessage

from agents.base import get_agent_info
from agents.query_rewriter import analyze_query
from agents.retrieval_strategist import retrieve, RetrievalResult
from agents.synthesis import synthesize, SynthesisResult
from agents.self_reflection import critique, CritiqueResult
from agents.web_researcher import search_and_answer, WebSearchResult
from api.events import AgentEventCollector, AgentEvent


# ── In-Memory Conversation Storage ──────────────────────────────
chat_histories: Dict[str, list] = {}


@dataclass
class OrchestratorResult:
    answer: str
    sources: List[Dict[str, Any]]
    mode_used: str
    reflection_loops: int
    confidence: float


def _build_context(sources: List[Dict[str, Any]]) -> str:
    """Build the LLM context string from retrieved document chunks."""
    return "\n\n".join(
        f"Document ({doc['source_file']}):\n{doc['content']}" for doc in sources
    )


def orchestrate_stream(
    session_id: str,
    message: str,
    mode: str,
    collector: AgentEventCollector,
) -> Generator[AgentEvent, None, OrchestratorResult]:
    """
    Orchestrate the full multi-agent pipeline, yielding SSE events at each step.
    
    This is a generator that yields AgentEvent objects for real-time streaming.
    The final return value is the OrchestratorResult (access via StopIteration.value).
    
    Agent execution order:
        1. Orchestrator    — Plan the execution
        2. Query Analyst   — Rewrite the query
        3. Retrieval Strat — Fetch documents
        4. Synthesis Agent — Generate answer
        5. Critic Agent    — Validate quality
        6. Web Researcher  — Fallback (if needed)
    """
    # Ensure session history exists
    if session_id not in chat_histories:
        chat_histories[session_id] = []

    history = chat_histories[session_id]

    # ── Step 1: Orchestrator — Plan ──────────────────────────────
    yield collector.emit(
        "orchestrating",
        agent=get_agent_info("orchestrator"),
        message="Building execution plan...",
        plan=[
            {"agent": "query_analyst", "task": "Optimize search query"},
            {"agent": "retrieval_strategist", "task": f"Retrieve documents ({mode} mode)"},
            {"agent": "synthesis", "task": "Generate answer from context"},
            {"agent": "critic", "task": "Validate answer quality"},
        ],
    )

    # ── Step 2: Query Analyst — Rewrite ──────────────────────────
    yield collector.emit(
        "delegating",
        agent=get_agent_info("orchestrator"),
        target=get_agent_info("query_analyst"),
        message="Delegating query analysis...",
    )

    query_result = analyze_query(message, history)

    yield collector.emit(
        "rewriting",
        agent=get_agent_info("query_analyst"),
        original=query_result.original,
        optimized=query_result.optimized,
    )

    search_query = query_result.optimized

    # ── Step 3: Retrieval Strategist — Fetch Documents ───────────
    yield collector.emit(
        "delegating",
        agent=get_agent_info("orchestrator"),
        target=get_agent_info("retrieval_strategist"),
        message=f"Delegating {mode} retrieval...",
    )

    mode_label = {
        "vectorless": "BM25 lexical search",
        "traditional": "dense vector search",
    }.get(mode, "dual retrieval (vector + BM25)")

    yield collector.emit(
        "searching",
        agent=get_agent_info("retrieval_strategist"),
        mode=mode if mode != "auto" else "hybrid",
        message=f"Running {mode_label}...",
    )

    retrieval_result = retrieve(search_query, mode=mode)

    yield collector.emit(
        "sources",
        agent=get_agent_info("retrieval_strategist"),
        count=len(retrieval_result.sources),
        method=retrieval_result.method,
        previews=[
            {
                "file": s.get("source_file", "unknown"),
                "score": s.get("score", 0),
                "preview": s.get("content", "")[:120],
            }
            for s in retrieval_result.sources[:5]
        ],
    )

    context_text = _build_context(retrieval_result.sources)
    mode_used = retrieval_result.method

    # ── Step 4: Synthesis Agent — Generate Answer ────────────────
    yield collector.emit(
        "delegating",
        agent=get_agent_info("orchestrator"),
        target=get_agent_info("synthesis"),
        message="Delegating answer generation...",
    )

    yield collector.emit(
        "generating",
        agent=get_agent_info("synthesis"),
        message="Generating answer with LLM...",
    )

    synthesis_result = synthesize(
        question=message,
        context_text=context_text,
        chat_history=history,
    )

    # ── Step 5: Critic Agent — Validate Quality ──────────────────
    reflection_loops = 0
    is_good_answer = False
    final_answer = synthesis_result.answer

    if synthesis_result.needs_web_search:
        # LLM itself said it can't answer from context → skip critic, go to web
        yield collector.emit(
            "reflecting",
            agent=get_agent_info("critic"),
            passed=False,
            loop=0,
            feedback="Answer not found in documents — escalating to web search",
        )
        is_good_answer = False

    elif not retrieval_result.sources:
        # No sources to validate against
        is_good_answer = True
        yield collector.emit(
            "reflecting",
            agent=get_agent_info("critic"),
            passed=True,
            loop=0,
            feedback="No sources to validate against — accepting answer",
        )

    else:
        yield collector.emit(
            "delegating",
            agent=get_agent_info("orchestrator"),
            target=get_agent_info("critic"),
            message="Delegating quality validation...",
        )

        critique_result = critique(
            question=message, context=context_text, answer=final_answer
        )

        if critique_result.passed:
            is_good_answer = True
            yield collector.emit(
                "reflecting",
                agent=get_agent_info("critic"),
                passed=True,
                loop=0,
                feedback=critique_result.feedback,
            )
        else:
            reflection_loops = 1
            yield collector.emit(
                "reflecting",
                agent=get_agent_info("critic"),
                passed=False,
                loop=1,
                feedback=critique_result.feedback,
            )

            # Re-route: ask Synthesis to try again with feedback
            yield collector.emit(
                "improving",
                agent=get_agent_info("synthesis"),
                loop=1,
                message="Re-generating answer with critic feedback...",
            )

            retry_result = synthesize(
                question=message,
                context_text=context_text,
                chat_history=history,
                feedback=critique_result.feedback,
            )
            final_answer = retry_result.answer
            is_good_answer = not retry_result.needs_web_search

    # ── Step 6: Web Researcher — Fallback ────────────────────────
    if not is_good_answer or not final_answer:
        yield collector.emit(
            "delegating",
            agent=get_agent_info("orchestrator"),
            target=get_agent_info("web_researcher"),
            message="Escalating to live web search...",
        )

        yield collector.emit(
            "web_search",
            agent=get_agent_info("web_researcher"),
            query=search_query,
            message="Searching the web via Tavily...",
        )

        web_result = search_and_answer(query=search_query, question=message)
        final_answer = web_result.answer
        mode_used = f"{mode_used} + tavily_search"

        if not web_result.success:
            yield collector.emit(
                "error",
                agent=get_agent_info("web_researcher"),
                message=f"Web search failed: {web_result.error}",
            )

    # ── Finalize ─────────────────────────────────────────────────
    # Write turns to session memory
    chat_histories[session_id].append(HumanMessage(content=message))
    chat_histories[session_id].append(AIMessage(content=final_answer))

    # Smart confidence scoring
    if is_good_answer and reflection_loops == 0:
        confidence = 0.95
    elif "tavily_search" in mode_used:
        confidence = 0.78
    elif reflection_loops > 0:
        confidence = 0.65
    else:
        confidence = 0.50

    yield collector.emit(
        "done",
        agent=get_agent_info("orchestrator"),
        answer=final_answer,
        mode_used=mode_used,
        confidence=confidence,
        reflection_loops=reflection_loops,
        tokens_used=150,
    )

    return OrchestratorResult(
        answer=final_answer,
        sources=retrieval_result.sources,
        mode_used=mode_used,
        reflection_loops=reflection_loops,
        confidence=confidence,
    )
