"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Bot, User, Sparkles, Database, Zap, Search, Copy, Check,
  ChevronDown, Square, PanelRightOpen, PanelRightClose, Brain,
} from "lucide-react"
import AgentTimeline from "../../components/chat/AgentTimeline"
import SourceCards from "../../components/chat/SourceCards"
import { api } from "../../lib/api"
import type { AgentEvent } from "../../types"

interface ChatMessage {
  id: string
  role: "user" | "ai"
  content: string
  mode?: string
  time?: string
  confidence?: number
  reflectionLoops?: number
  agentEvents?: AgentEvent[]
  sources?: Array<{ file: string; score: number; preview: string; method?: string }>
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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("auto")
  const [modeOpen, setModeOpen] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [showPanel, setShowPanel] = useState(true)
  const [liveEvents, setLiveEvents] = useState<AgentEvent[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modeMenuRef = useRef<HTMLDivElement>(null)
  const abortController = useRef<AbortController | null>(null)

  useEffect(() => {
    setSessionId(crypto.randomUUID())
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setModeOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  const activeMode = MODES.find((m) => m.value === mode) ?? MODES[0]

  const handleSend = useCallback(async (textToSend: string = input) => {
    if (!textToSend.trim() || loading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: textToSend,
      time: now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setIsStreaming(true)
    setLiveEvents([])
    setShowPanel(true)
    abortController.current = new AbortController()

    let finalAnswer = ""
    let finalConfidence = 0
    let finalLoops = 0
    let finalMode = ""
    let collectedEvents: AgentEvent[] = []
    let collectedSources: Array<{ file: string; score: number; preview: string; method?: string }> = []

    try {
      for await (const event of api.chatStream(sessionId, textToSend, mode, abortController.current.signal)) {
        collectedEvents = [...collectedEvents, event]
        setLiveEvents([...collectedEvents])

        if (event.event === "sources" && event.data.previews) {
          collectedSources = event.data.previews.map((p: any) => ({
            file: p.file,
            score: p.score,
            preview: p.preview,
            method: event.data.method,
          }))
        }

        if (event.event === "done") {
          finalAnswer = event.data.answer
          finalConfidence = event.data.confidence
          finalLoops = event.data.reflection_loops
          finalMode = event.data.mode_used
        }

        if (event.event === "error") {
          finalAnswer = event.data.message || "An error occurred."
        }
      }
    } catch (error) {
      console.error("Stream Error:", error)
      finalAnswer = "Sorry — I couldn't reach the server. Please make sure the backend is running and try again."
    }

    setIsStreaming(false)

    if (finalAnswer) {
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        content: finalAnswer,
        mode: finalMode,
        time: now(),
        confidence: finalConfidence,
        reflectionLoops: finalLoops,
        agentEvents: collectedEvents,
        sources: collectedSources,
      }
      setMessages((prev) => [...prev, aiMessage])
    }

    setLoading(false)
  }, [input, loading, sessionId, mode])

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    } catch { /* no-op */ }
  }

  return (
    <div className="relative flex h-screen bg-[#0a0a0c] font-sans text-zinc-100 selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-50">
        <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-purple-600/10 mix-blend-screen blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-teal-600/10 mix-blend-screen blur-[120px]" />
      </div>

      {/* Main chat column */}
      <div className="z-10 flex min-h-0 flex-1 flex-col">
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
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Agentic RAG · Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode selector */}
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

              <AnimatePresence>
                {modeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-30 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-xl"
                  >
                    {MODES.map((m) => {
                      const selected = m.value === mode
                      return (
                        <button
                          key={m.value}
                          onClick={() => { setMode(m.value); setModeOpen(false) }}
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Panel toggle */}
            <button
              onClick={() => setShowPanel((s) => !s)}
              className="hidden rounded-lg border border-zinc-700/50 bg-zinc-900/80 p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 lg:flex"
              title={showPanel ? "Hide agent panel" : "Show agent panel"}
            >
              {showPanel ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth" data-lenis-prevent="true">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Empty State */}
            <AnimatePresence>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-10 flex flex-col items-center justify-center"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 shadow-xl shadow-purple-900/10">
                    <Sparkles className="text-purple-400" size={32} />
                  </div>
                  <h2 className="mb-2 text-2xl font-semibold text-balance text-zinc-100">What would you like to know?</h2>
                  <p className="mb-8 text-zinc-500">Ask questions about your uploaded documents. The AI will search, reason, and verify before responding.</p>

                  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                    {STARTER_PROMPTS.map((prompt, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ y: -2 }}
                        onClick={() => handleSend(prompt.text)}
                        className="group flex flex-col items-start rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 text-left backdrop-blur-sm transition-all hover:border-purple-500/40 hover:bg-zinc-800"
                      >
                        <span className="mb-3 rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-transform group-hover:scale-110">
                          <prompt.Icon size={16} />
                        </span>
                        <span className="text-sm text-zinc-300 group-hover:text-zinc-100">{prompt.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800">
                    <Bot size={16} className="text-purple-400" />
                  </div>
                )}

                <div className="flex max-w-[80%] flex-col gap-1.5">
                  {/* Inline Agent Timeline (Mobile only) */}
                  {msg.role === "ai" && msg.agentEvents && msg.agentEvents.length > 0 && (
                    <div className="mb-1 block w-full lg:hidden">
                      <details className="group/timeline rounded-lg border border-zinc-800/80 bg-zinc-900/50">
                        <summary className="flex cursor-pointer items-center justify-between p-3 text-xs text-zinc-400 hover:text-zinc-300">
                          <span className="flex items-center gap-2">
                            <Brain size={14} className="text-purple-400" />
                            Show agent reasoning
                          </span>
                          <ChevronDown size={14} className="transition-transform group-open/timeline:rotate-180" />
                        </summary>
                        <div className="border-t border-zinc-800/80 p-3 pt-4 max-h-[300px] overflow-y-auto">
                          <AgentTimeline events={msg.agentEvents} isStreaming={false} />
                        </div>
                      </details>
                    </div>
                  )}

                  <div
                    className={`group relative rounded-2xl p-4 leading-relaxed shadow-sm backdrop-blur-sm ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-gradient-to-br from-violet-600 to-indigo-700 text-white"
                        : "rounded-tl-sm border border-zinc-800/80 bg-zinc-900/80 text-zinc-200"
                    }`}
                  >
                    <div className={`whitespace-pre-wrap ${msg.role === "ai" ? "animate-[fadeIn_0.4s_ease-out]" : ""}`}>{msg.content}</div>

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
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500/60" />
                        {msg.confidence !== undefined && msg.confidence > 0 
                          ? `✓ ${msg.confidence}% confidence · ${msg.reflectionLoops} loops · ${msg.mode}` 
                          : `Engine: ${msg.mode}`}
                      </div>
                    )}
                  </div>

                  {/* Sources */}
                  {msg.role === "ai" && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1">
                      <SourceCards sources={msg.sources} />
                    </div>
                  )}

                  {msg.time && (
                    <span className={`px-1 font-mono text-[10px] text-zinc-600 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                      {msg.time}
                    </span>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-700/50 bg-violet-900/50">
                    <User size={16} className="text-violet-400" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing Indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex justify-start gap-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800">
                    <Bot size={16} className="text-purple-400" />
                  </div>
                  <div className="flex max-w-[80%] flex-col gap-1.5">
                    {/* Live Inline Agent Timeline (Mobile only) */}
                    {liveEvents.length > 0 && (
                      <div className="mb-1 block w-full lg:hidden">
                        <details open className="group/timeline rounded-lg border border-zinc-800/80 bg-zinc-900/50">
                          <summary className="flex cursor-pointer items-center justify-between p-3 text-xs text-zinc-400 hover:text-zinc-300">
                            <span className="flex items-center gap-2">
                              <Brain size={14} className="text-purple-400" />
                              <span className="flex items-center gap-2">
                                Agent reasoning
                                <span className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2 py-0.5">
                                  <span className="h-1 w-1 animate-pulse rounded-full bg-purple-400" />
                                  <span className="text-[10px] text-purple-400">Live</span>
                                </span>
                              </span>
                            </span>
                            <ChevronDown size={14} className="transition-transform group-open/timeline:rotate-180" />
                          </summary>
                          <div className="border-t border-zinc-800/80 p-3 pt-4 max-h-[300px] overflow-y-auto">
                            <AgentTimeline events={liveEvents} isStreaming={true} />
                          </div>
                        </details>
                      </div>
                    )}
                    <div className="w-fit flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-zinc-800/80 bg-zinc-900/80 p-4 backdrop-blur-sm">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                onClick={() => {
                  if (loading) {
                    abortController.current?.abort()
                  } else {
                    handleSend()
                  }
                }}
                disabled={!loading && !input.trim()}
                aria-label={loading ? "Stop generating" : "Send message"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 transition-all hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {loading ? <Square size={16} className="fill-current" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Reasoning Panel — right sidebar */}
      <AnimatePresence>
        {showPanel && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="hidden flex-shrink-0 overflow-hidden border-l border-zinc-800/50 bg-[#0a0a0c]/90 backdrop-blur-xl lg:block"
          >
            <div className="flex h-full w-[320px] flex-col overflow-y-auto p-5" data-lenis-prevent="true">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-400">
                    Agent Panel
                  </h2>
                </div>
                {isStreaming && (
                  <span className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
                    <span className="font-mono text-[10px] text-purple-400">Live</span>
                  </span>
                )}
              </div>

              {liveEvents.length === 0 && !isStreaming ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <Brain className="h-8 w-8 text-zinc-700" />
                  </div>
                  <p className="text-sm text-zinc-600">Agent reasoning will appear here</p>
                  <p className="mt-1 text-xs text-zinc-700">Send a message to see the AI think</p>
                </div>
              ) : (
                <AgentTimeline events={liveEvents} isStreaming={isStreaming} />
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}