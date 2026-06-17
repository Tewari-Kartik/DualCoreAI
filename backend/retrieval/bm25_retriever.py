import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from rank_bm25 import BM25Okapi

UPLOAD_DIR = "data/uploads"

def get_bm25_results(query: str, top_k: int = 3):
    """Reads local files and performs a vectorless keyword search."""
    documents = []
    
    # 1. Load everything currently in the uploads folder
    if not os.path.exists(UPLOAD_DIR):
        return []
        
    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        if filename.endswith(".pdf"):
            documents.extend(PyPDFLoader(file_path).load())
        elif filename.endswith(".txt"):
            documents.extend(TextLoader(file_path).load())
        elif filename.endswith(".docx"):
            documents.extend(Docx2txtLoader(file_path).load())

    if not documents:
        return []

    # 2. Chunk them (just like traditional RAG, but for keyword matching)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    
    # 3. Tokenize text and build the BM25 search index on the fly
    tokenized_corpus = [chunk.page_content.lower().split(" ") for chunk in chunks]
    bm25 = BM25Okapi(tokenized_corpus)
    
    # 4. Search and score
    tokenized_query = query.lower().split(" ")
    doc_scores = bm25.get_scores(tokenized_query)
    
    # 5. Get top K results
    top_n_indices = sorted(range(len(doc_scores)), key=lambda i: doc_scores[i], reverse=True)[:top_k]
    
    results = []
    for idx in top_n_indices:
        if doc_scores[idx] > 0: # Only return if there's actually a keyword match
            chunk = chunks[idx]
            source_file = chunk.metadata.get("source", "Unknown").split("/")[-1].split("\\")[-1]
            results.append({
                "id": f"bm25_{idx}",
                "content": chunk.page_content,
                "source_file": source_file,
                "score": float(doc_scores[idx]),
                "retrieval_method": "sparse"
            })
            
    return results