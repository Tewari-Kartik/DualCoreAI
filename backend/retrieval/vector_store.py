from langchain_chroma import Chroma
from retrieval.embeddings import get_embeddings
import os

# We will store the database right where you planned
CHROMA_PATH = "data/chroma_db"

def get_vector_store():
    """Initializes and returns the Chroma vector database connection."""
    return Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=get_embeddings()
    )