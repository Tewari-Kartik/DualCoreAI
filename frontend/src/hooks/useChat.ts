"use client"

import { useState, useCallback } from "react"
import { api } from "../lib/api"
import type { Message, ChatMode, ChatResponse } from "../types"

// We use crypto.randomUUID() for unique message IDs
export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string, mode: ChatMode = "auto") => {
    setError(null)
    
    // 1. Instantly add the user's message to the screen
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      // 2. Call the Python backend
      const res = await api.chat(sessionId, content, mode) as ChatResponse
      
      // 3. Add the AI's response to the screen
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.answer,
        sources: res.sources,
        rag_mode_used: res.rag_mode_used,
        reflection_loops: res.reflection_loops,
        confidence: res.confidence,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  const clearChat = useCallback(async () => {
    await api.clearMemory(sessionId)
    setMessages([])
  }, [sessionId])

  return { messages, loading, error, sendMessage, clearChat }
}