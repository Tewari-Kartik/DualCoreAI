"""
Structured agent event system for streaming agentic reasoning steps to the frontend.
Each step of the RAG pipeline emits a typed event via SSE.
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, field, asdict
from typing import Any, AsyncGenerator, Dict, List, Optional


@dataclass
class AgentEvent:
    event: str          # thinking, rewriting, searching, sources, generating, reflecting, web_search, improving, done, error
    data: Dict[str, Any] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)

    def to_sse(self) -> str:
        """Format as a Server-Sent Event line."""
        payload = json.dumps(asdict(self), default=str)
        return f"data: {payload}\n\n"


class AgentEventCollector:
    """Collects events during a single chat request for logging and streaming."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.events: List[AgentEvent] = []
        self._start_time = time.time()

    def emit(self, event: str, **data) -> AgentEvent:
        evt = AgentEvent(event=event, data=data)
        self.events.append(evt)
        return evt

    def thinking(self, message: str = "Analyzing your question..."):
        return self.emit("thinking", message=message)

    def rewriting(self, original: str, optimized: str):
        return self.emit("rewriting", original=original, optimized=optimized)

    def searching(self, mode: str, message: str = "Running retrieval..."):
        return self.emit("searching", mode=mode, message=message)

    def sources_found(self, sources: list, method: str):
        return self.emit("sources", count=len(sources), method=method,
                         previews=[{"file": s.get("source_file", "unknown"),
                                    "score": s.get("score", 0),
                                    "preview": s.get("content", "")[:120]}
                                   for s in sources[:5]])

    def generating(self, message: str = "Generating answer..."):
        return self.emit("generating", message=message)

    def reflecting(self, passed: bool, loop: int, feedback: str = ""):
        return self.emit("reflecting", passed=passed, loop=loop, feedback=feedback)

    def web_search(self, query: str, message: str = "Searching the web..."):
        return self.emit("web_search", query=query, message=message)

    def improving(self, loop: int, message: str = "Re-generating with feedback..."):
        return self.emit("improving", loop=loop, message=message)

    def done(self, answer: str, mode_used: str, confidence: float,
             reflection_loops: int, tokens_used: int):
        return self.emit("done", answer=answer, mode_used=mode_used,
                         confidence=confidence, reflection_loops=reflection_loops,
                         tokens_used=tokens_used)

    def error(self, message: str):
        return self.emit("error", message=message)

    def total_duration_ms(self) -> int:
        return int((time.time() - self._start_time) * 1000)

    def to_log_entry(self) -> dict:
        return {
            "session_id": self.session_id,
            "duration_ms": self.total_duration_ms(),
            "events": [asdict(e) for e in self.events],
            "event_count": len(self.events),
        }


# Global in-memory log store (same pattern as chat_histories)
_agent_logs: Dict[str, List[dict]] = {}


def store_agent_log(session_id: str, log_entry: dict):
    if session_id not in _agent_logs:
        _agent_logs[session_id] = []
    _agent_logs[session_id].append(log_entry)
    # Keep last 50 traces per session
    _agent_logs[session_id] = _agent_logs[session_id][-50:]


def get_agent_logs(session_id: str) -> List[dict]:
    return _agent_logs.get(session_id, [])


def get_all_session_ids() -> List[str]:
    return list(_agent_logs.keys())
