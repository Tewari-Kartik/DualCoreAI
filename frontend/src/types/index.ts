export type RetrievalMethod = "dense" | "sparse" | "hybrid" | "in-context"
export type RAGMode = "traditional" | "vectorless" | "hybrid"
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
  rag_mode_used?: string
  reflection_loops?: number
  confidence?: number
  timestamp: Date
  agentEvents?: AgentEvent[]
}

export interface ChatResponse {
  session_id: string
  answer: string
  sources: Source[]
  rag_mode_used: string
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

export type UploadStatus = "pending" | "processing" | "indexed" | "failed"

export interface UploadedFile {
  id: string
  name: string
  status: UploadStatus
  error?: string
}

// --- Agent Event Types ---

// Agent identity metadata from the backend
export interface AgentInfo {
  name: string
  role: string
  color: string
  icon: string
}


export type AgentEventType =
  | "thinking"
  | "rewriting"
  | "searching"
  | "sources"
  | "generating"
  | "reflecting"
  | "web_search"
  | "improving"
  | "orchestrating"
  | "delegating"
  | "critique"
  | "done"
  | "error"

export interface AgentEvent {
  event: AgentEventType
  data: Record<string, any>
  timestamp: number
  agent?: AgentInfo
  target?: AgentInfo
  plan?: Array<{agent: string, task: string}>
}

export interface AgentTrace {
  session_id: string
  duration_ms: number
  events: AgentEvent[]
  event_count: number
}

export interface AgentLogsResponse {
  session_id: string
  traces: AgentTrace[]
  count: number
}

export interface SessionListResponse {
  sessions: string[]
  count: number
}