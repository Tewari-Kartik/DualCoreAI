from pydantic import BaseModel
from typing import Optional, Literal

class ChatRequest(BaseModel):
    session_id: str
    message: str
    mode: Literal["auto", "traditional", "vectorless"] = "auto"

class Source(BaseModel):
    id: str
    content: str
    source_file: str
    score: float

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sources: list[Source]
    rag_mode_used: str

class UploadResponse(BaseModel):
    filename: str
    status: str
    message: str