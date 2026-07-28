import type { AgentEvent, AgentLogsResponse, SessionListResponse } from "../types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080"
const BASE = `${BASE_URL}/api`

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? "API error")
  }
  return res.json()
}

export const api = {
  chat: (sessionId: string, message: string, mode = "auto") =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, message, mode }),
    }),

  /** SSE streaming chat — yields AgentEvents in real-time */
  chatStream: async function* (
    sessionId: string,
    message: string,
    mode = "auto",
    abortSignal?: AbortSignal
  ): AsyncGenerator<AgentEvent> {
    const res = await fetch(`${BASE}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message, mode }),
      signal: abortSignal,
    })

    if (!res.ok || !res.body) {
      throw new Error("Failed to connect to streaming endpoint")
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // SSE format: "data: {...}\n\n"
      const lines = buffer.split("\n\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith("data: ")) {
          try {
            const event: AgentEvent = JSON.parse(trimmed.slice(6))
            yield event
          } catch {
            // skip malformed events
          }
        }
      }
    }
  },

  upload: (file: File) => {
    const form = new FormData()
    form.append("file", file)
    return request("/upload", {
      method: "POST",
      body: form,
      headers: {},
    })
  },

  getMemory: (sessionId: string) => request(`/memory/${sessionId}`),

  clearMemory: (sessionId: string) =>
    request(`/memory/${sessionId}`, { method: "DELETE" }),

  health: () => request("/health"),

  // --- Agent Dashboard APIs ---
  getAgentSessions: () => request<SessionListResponse>("/agent-logs"),

  getAgentLogs: (sessionId: string) =>
    request<AgentLogsResponse>(`/agent-logs/${sessionId}`),
}