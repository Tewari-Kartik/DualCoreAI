// Change localhost to 127.0.0.1
const BASE = "http://127.0.0.1:8000/api"
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
    
  upload: (file: File) => {
    const form = new FormData()
    form.append("file", file)
    return request("/upload", {
      method: "POST",
      body: form,
      headers: {}, // let browser set multipart boundary
    })
  },
  
  getMemory: (sessionId: string) =>
    request(`/memory/${sessionId}`),
    
  clearMemory: (sessionId: string) =>
    request(`/memory/${sessionId}`, { method: "DELETE" }),
    
  health: () => request("/health"),
}