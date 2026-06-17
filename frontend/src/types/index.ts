export type RetrievalMethod = "dense" | "sparse" | "hybrid" | "in-context"
export type RAGMode = "traditional" | "vectorless"
export type ChatMode = "auto" | "traditional" | "vectorless"

export interface Source {
  id: string
  content: string
  source_file: string
  page?: number
  score: number
  retrieval_method: RetrievalMethod
}

export interface MemoryEntry {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  rag_mode_used?: RAGMode
  reflection_loops?: number
  confidence?: number
  timestamp: Date
}

export interface ChatResponse {
  session_id: string
  answer: string
  sources: Source[]
  rag_mode_used: RAGMode
  reflection_loops: number
  confidence: number
  tokens_used: number
}

export interface UploadResponse {
  filename: string
  chunks_created: number
  tokens_estimated: number
  status: "indexed" | "in-context"
  message: string
}