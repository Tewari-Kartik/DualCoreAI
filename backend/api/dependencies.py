"""
Shared FastAPI dependencies: DB sessions, settings, and (optional) auth.

Import these with `Depends(...)` in route handlers, e.g.:

    @router.get("/memory/{session_id}")
    def get_memory(session_id: str, db: Session = Depends(get_db)):
        ...
"""

from functools import lru_cache
from typing import Generator, Optional

from fastapi import Header, HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.core.config import Settings


@lru_cache
def get_settings() -> Settings:
    # Cached so os.environ / .env is only parsed once per process.
    return Settings()


def _build_session_factory():
    settings = get_settings()
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


_SessionLocal = None


def get_db() -> Generator[Session, None, None]:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = _build_session_factory()
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    x_api_key: Optional[str] = Header(default=None),
    settings: Settings = None,  # resolved below
) -> str:
    """
    Minimal API-key auth. Swap for JWT/OAuth later — routes only depend on
    the return value (a user/session identifier), not on how it's derived.
    """
    settings = settings or get_settings()

    if not settings.require_auth:
        return "anonymous"

    if not x_api_key or x_api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid API key",
        )
    return x_api_key
