"""
Short-term (working) memory: the rolling conversation buffer for a session.

Defaults to an in-process dict so local dev needs zero infra. If REDIS_URL is
set, swap to Redis transparently so it survives restarts and works across
multiple backend instances — same interface either way.
"""

from __future__ import annotations

import json
import time
from collections import defaultdict, deque
from typing import Deque, Dict, List, Optional

from backend.api.dependencies import get_settings

MAX_TURNS = 20  # keep the buffer short — long-term facts live elsewhere


class ShortTermMemory:
    def get_history(self, session_id: str) -> List[dict]:
        raise NotImplementedError

    def append(self, session_id: str, role: str, content: str) -> None:
        raise NotImplementedError

    def clear(self, session_id: str) -> None:
        raise NotImplementedError


class InMemoryShortTermMemory(ShortTermMemory):
    def __init__(self, max_turns: int = MAX_TURNS):
        self._buffers: Dict[str, Deque[dict]] = defaultdict(lambda: deque(maxlen=max_turns))

    def get_history(self, session_id: str) -> List[dict]:
        return list(self._buffers[session_id])

    def append(self, session_id: str, role: str, content: str) -> None:
        self._buffers[session_id].append({"role": role, "content": content, "ts": time.time()})

    def clear(self, session_id: str) -> None:
        self._buffers.pop(session_id, None)


class RedisShortTermMemory(ShortTermMemory):
    def __init__(self, redis_url: str, max_turns: int = MAX_TURNS):
        import redis  # local import — optional dependency, only needed here

        self._client = redis.Redis.from_url(redis_url, decode_responses=True)
        self._max_turns = max_turns

    def _key(self, session_id: str) -> str:
        return f"chat:short_term:{session_id}"

    def get_history(self, session_id: str) -> List[dict]:
        raw = self._client.lrange(self._key(session_id), 0, -1)
        return [json.loads(item) for item in raw]

    def append(self, session_id: str, role: str, content: str) -> None:
        key = self._key(session_id)
        entry = json.dumps({"role": role, "content": content, "ts": time.time()})
        pipe = self._client.pipeline()
        pipe.rpush(key, entry)
        pipe.ltrim(key, -self._max_turns, -1)
        pipe.execute()

    def clear(self, session_id: str) -> None:
        self._client.delete(self._key(session_id))


_instance: Optional[ShortTermMemory] = None


def get_short_term_memory() -> ShortTermMemory:
    global _instance
    if _instance is not None:
        return _instance

    settings = get_settings()
    redis_url = getattr(settings, "redis_url", None)
    _instance = RedisShortTermMemory(redis_url) if redis_url else InMemoryShortTermMemory()
    return _instance
