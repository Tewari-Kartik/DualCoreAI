from typing import List

from pydantic import BaseModel, Field


class RememberFactIn(BaseModel):
    fact: str = Field(..., min_length=1, max_length=1000)


class MemoryFactOut(BaseModel):
    id: str
    fact: str
    createdAt: str


class MemoryHistoryOut(BaseModel):
    session_id: str
    facts: List[MemoryFactOut]
