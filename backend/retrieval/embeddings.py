from langchain_huggingface import HuggingFaceEmbeddings

def get_embeddings():
    # all-MiniLM-L6-v2 is an incredibly fast and efficient model for local RAG
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")