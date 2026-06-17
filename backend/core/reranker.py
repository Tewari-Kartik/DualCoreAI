def reciprocal_rank_fusion(vector_results: list, keyword_results: list, top_k: int = 3, k_constant: int = 60) -> list:
    """
    Combines dense vector search results and sparse keyword search results
    using the Reciprocal Rank Fusion (RRF) algorithm.
    """
    rrf_scores = {}
    content_map = {}
    
    # Helper to calculate RRF scores based on position index
    def process_results(results, method_label):
        for rank, doc in enumerate(results):
            # Create a unique key based on filename and snippet content hash
            doc_id = f"{doc['source_file']}_{hash(doc['content'])}"
            content_map[doc_id] = doc
            
            if doc_id not in rrf_scores:
                rrf_scores[doc_id] = 0.0
            
            # Standard RRF formula: 1 / (k + rank)
            rrf_scores[doc_id] += 1.0 / (k_constant + (rank + 1))
            # Tag which extraction methods pulled this document
            if "retrieval_method" in content_map[doc_id]:
                if method_label not in content_map[doc_id]["retrieval_method"]:
                    content_map[doc_id]["retrieval_method"] += f" + {method_label}"

    process_results(vector_results, "dense")
    process_results(keyword_results, "sparse")
    
    # Sort documents by their combined RRF score descending
    sorted_docs = sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)
    
    final_sources = []
    for rank, (doc_id, score) in enumerate(sorted_docs[:top_k]):
        base_doc = content_map[doc_id]
        final_sources.append({
            "id": f"hybrid_{rank}",
            "content": base_doc["content"],
            "source_file": base_doc["source_file"],
            "score": round(score, 4),
            "retrieval_method": base_doc.get("retrieval_method", "hybrid")
        })
        
    return final_sources