from retrieval.bm25_retriever import get_bm25_results

def retrieve_documents_vectorless(query: str, top_k: int = 3):
    """
    Bypasses ChromaDB entirely and uses pure keyword matching (BM25).
    Highly effective for specific nouns, serial numbers, or exact phrases.
    """
    print("Executing Vectorless (BM25) Retrieval...")
    return get_bm25_results(query, top_k=top_k)