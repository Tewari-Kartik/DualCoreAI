from retrieval.vector_store import get_vector_store

def retrieve_documents(query: str, top_k: int = 3):
    """Fetches the most relevant document chunks from ChromaDB."""
    vector_store = get_vector_store()
    
    # Perform a similarity search against the database
    # This returns the raw chunks + their relevance score
    results = vector_store.similarity_search_with_score(query, k=top_k)
    
    # Format the results so your React frontend can display them in the SourceCards
    formatted_sources = []
    for doc, score in results:
        # Extract just the filename from the full path
        source_path = doc.metadata.get("source", "Unknown")
        filename = source_path.split("/")[-1].split("\\")[-1] 
        
        formatted_sources.append({
            "id": str(id(doc)), 
            "content": doc.page_content,
            "source_file": filename,
            "score": float(score),
            "retrieval_method": "dense"
        })
        
    return formatted_sources