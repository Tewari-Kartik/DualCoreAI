from langchain_community.embeddings.fastembed import FastEmbedEmbeddings

def get_embeddings():
    # Using FastEmbed instead of HuggingFaceEmbeddings (PyTorch) to drastically reduce memory usage
    # This prevents Out-Of-Memory (OOM) errors on platforms like Render's free tier.
    return FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")