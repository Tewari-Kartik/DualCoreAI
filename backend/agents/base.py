"""
Base agent class and shared types for the multi-agent orchestrator system.
Every agent follows a consistent interface: execute() → AgentResult.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class AgentInfo:
    """Identity metadata — sent to the frontend for rendering."""
    name: str
    role: str
    color: str       # hex color for UI glow
    icon: str         # lucide-react icon name


@dataclass
class AgentResult:
    """Standard return envelope from any agent."""
    success: bool
    data: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None


# ── Agent Registry ──────────────────────────────────────────────
# Each agent's visual identity, used by the event system so the
# frontend can render agent-specific avatars, colors, and labels.

AGENTS = {
    "orchestrator": AgentInfo(
        name="Orchestrator",
        role="Central Coordinator",
        color="#9D7CFF",
        icon="Brain",
    ),
    "query_analyst": AgentInfo(
        name="Query Analyst",
        role="Query Optimization",
        color="#3FC9B5",
        icon="Search",
    ),
    "retrieval_strategist": AgentInfo(
        name="Retrieval Strategist",
        role="Document Fetching",
        color="#60a5fa",
        icon="Database",
    ),
    "synthesis": AgentInfo(
        name="Synthesis Agent",
        role="Answer Generation",
        color="#E8A33D",
        icon="Sparkles",
    ),
    "critic": AgentInfo(
        name="Critic Agent",
        role="Quality Control",
        color="#ef4444",
        icon="ShieldCheck",
    ),
    "web_researcher": AgentInfo(
        name="Web Researcher",
        role="Live Web Search",
        color="#f97316",
        icon="Globe",
    ),
}


def get_agent_info(agent_key: str) -> dict:
    """Return agent info as a plain dict for JSON serialization."""
    info = AGENTS.get(agent_key)
    if not info:
        return {"name": agent_key, "role": "Unknown", "color": "#6b7280", "icon": "Bot"}
    return {"name": info.name, "role": info.role, "color": info.color, "icon": info.icon}
