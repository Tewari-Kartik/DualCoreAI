"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, Bot, User, Sparkles, Database, Zap, Search, Copy, Check, ChevronDown, Square } from "lucide-react"
import { AnimatedBackground } from '../../components/ui/animated-background'

interface Message {
  role: "user" | "ai"
  content: string
  mode?: string
  time?: string
}

const MODES = [
  { value: "auto", label: "Auto · Hybrid", hint: "Best of vector + keyword", Icon: Zap },
  { value: "traditional", label: "Traditional · Vector", hint: "Dense semantic search", Icon: Database },
  { value: "vectorless", label: "Vectorless · Keyword", hint: "Sparse BM25 retrieval", Icon: Search },
]

const STARTER_PROMPTS = [
  { Icon: Database, text: "Summarize the key findings in my document" },
  { Icon: Zap, text: "What is vectorless RAG?" },
  { Icon: Search, text: "Compare the uploaded reports" },
]

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState("")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("auto")
  const [modeOpen, setModeOpen] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modeMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSessionId(crypto.randomUUID())
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Close mode menu on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setModeOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  const activeMode = MODES.find((m) => m.value === mode) ?? MODES[0]

  const handleSend = async (textToSend: string = input) => {
    if (!textToSend.trim() || loading) return

    const userMessage: Message = { role: "user", content: textToSend, time: now() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Look for the Vercel variable first, and only use localhost if it's missing!
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage.content,
          mode: mode,
        }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        role: "ai",
        content: data.answer,
        mode: data.rag_mode_used,
        time: now(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry — I couldn't reach the server. Please make sure the backend is running and try again.",
          time: now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="relative flex h-screen flex-col bg-[#0a0a0c] font-sans text-zinc-100 selection:bg-purple-500/30">
      <AnimatedBackground />

      {/* Header */}
      <header className="z-20 flex flex-shrink-0 items-center justify-between border-b border-zinc-800/50 bg-[#0a0a0c]/70 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 p-2 shadow-lg shadow-purple-500/20">
            <Bot size={22} className="text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0c] bg-emerald-400" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              Neural Chat
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">RAG Assistant · Online</p>
          </div>
        </div>

        {/* Custom mode selector */}
        <div ref={modeMenuRef} className="relative">
          <button
            onClick={() => setModeOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-900/80 py-2 pl-3 pr-2.5 text-sm text-zinc-300 backdrop-blur-sm transition-all hover:border-purple-500/40 hover:bg-zinc-800"
          >
            <activeMode.Icon size={14} className="text-purple-400" />
            <span className="hidden sm:inline">{activeMode.label}</span>
            <span className="sm:hidden">Mode</span>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform ${modeOpen ? "rotate-180" : ""}`} />
          </button>

          {modeOpen && (
            <div className="absolute right-0 z-30 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-xl animate-[fadeIn_0.15s_ease-out]">
              {MODES.map((m) => {
                const selected = m.value === mode
                return (
                  <button
                    key={m.value}
                    onClick={() => {
                      setMode(m.value)
                      setModeOpen(false)
                    }}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      selected ? "bg-purple-500/10" : "hover:bg-zinc-800"
                    }`}
                  >
                    <m.Icon size={16} className={`mt-0.5 ${selected ? "text-purple-400" : "text-zinc-500"}`} />
                    <span className="flex flex-col">
                      <span className={`text-sm ${selected ? "text-zinc-100" : "text-zinc-300"}`}>{m.label}</span>
                      <span className="text-xs text-zinc-500">{m.hint}</span>
                    </span>
                    {selected && <Check size={14} className="ml-auto mt-0.5 text-purple-400" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <div className="z-10 flex-1 overflow-y-auto px-4 py-8 scroll-smooth">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="mt-10 flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 shadow-xl shadow-purple-900/10">
                <Sparkles className="text-purple-400" size={32} />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-balance text-zinc-100">How can I help you today?</h2>
              <p className="mb-8 text-zinc-500">Ask a question or try a starting prompt below.</p>

              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    className="group flex flex-col items-start rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 text-left backdrop-blur-sm transition-all hover:border-purple-500/40 hover:bg-zinc-800"
                  >
                    <span className="mb-3 rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-transform group-hover:scale-110">
                      <prompt.Icon size={16} />
                    </span>
                    <span className="text-sm text-zinc-300 group-hover:text-zinc-100">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 animate-[msgIn_0.35s_ease-out] ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "ai" && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800">
                  <Bot size={16} className="text-purple-400" />
                </div>
              )}

              <div className="flex max-w-[80%] flex-col gap-1">
                <div
                  className={`group relative rounded-2xl p-4 leading-relaxed shadow-sm backdrop-blur-sm ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                      : "rounded-tl-sm border border-zinc-800/80 bg-zinc-900/80 text-zinc-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.role === "ai" && (
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      aria-label="Copy message"
                      className="absolute right-2 top-2 rounded-md border border-zinc-800 bg-zinc-900/80 p-1.5 text-zinc-500 opacity-0 transition-all hover:text-zinc-200 group-hover:opacity-100"
                    >
                      {copiedIdx === idx ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  )}

                  {msg.role === "ai" && msg.mode && (
                    <div className="mt-3 flex items-center gap-2 border-t border-zinc-800/50 pt-3 font-mono text-[11px] text-zinc-500">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500/60" />
                      Engine: {msg.mode}
                    </div>
                  )}
                </div>
                {msg.time && (
                  <span
                    className={`px-1 font-mono text-[10px] text-zinc-600 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.time}
                  </span>
                )}
              </div>

              {msg.role === "user" && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-700/50 bg-blue-900/50">
                  <User size={16} className="text-blue-400" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800">
                <Bot size={16} className="text-purple-400" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-zinc-800/80 bg-zinc-900/80 p-4 backdrop-blur-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="z-10 flex-shrink-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent px-4 pb-6 pt-6">
        <div className="group relative mx-auto max-w-3xl">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 blur transition duration-500 group-focus-within:opacity-100" />
          <div className="relative flex items-end gap-2 rounded-2xl border border-zinc-700/50 bg-zinc-900/90 p-2 shadow-2xl backdrop-blur-xl transition-colors focus-within:border-purple-500/50">
            <textarea
              ref={textareaRef}
              rows={1}
              className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Message Neural Chat..."
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 transition-all hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {loading ? <Square size={16} className="fill-current" /> : <Send size={18} />}
            </button>
          </div>
          <p className="mt-3 text-center text-xs font-medium text-zinc-600">
            Press <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">Enter</kbd> to
            send, <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">Shift+Enter</kbd>{" "}
            for a new line. AI can make mistakes.
          </p>
        </div>
      </div>
    </div>
  )
}