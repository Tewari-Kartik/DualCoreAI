from fastapi import APIRouter
from api.events import get_agent_logs, get_all_session_ids

router = APIRouter()


@router.get("/agent-logs")
async def list_sessions():
    """List all session IDs that have agent logs."""
    sessions = get_all_session_ids()
    return {"sessions": sessions, "count": len(sessions)}


@router.get("/agent-logs/{session_id}")
async def get_session_logs(session_id: str):
    """Get full agent reasoning traces for a session."""
    logs = get_agent_logs(session_id)
    return {"session_id": session_id, "traces": logs, "count": len(logs)}
