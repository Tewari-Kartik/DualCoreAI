import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()
BASE_DIR = Path(__file__).parent

class Settings(BaseModel):
    # We will expand this in Phase 2, keeping it minimal for Phase 1
    api_title: str = "Hybrid RAG API"
    api_version: str = "1.0.0"

settings = Settings()