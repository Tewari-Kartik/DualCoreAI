"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Brain, Activity, Zap, Globe, RefreshCw, Shield,
  ChevronRight, Clock, Hash, Search, FileText, Sparkles,
  CheckCircle2, XCircle, AlertCircle, Loader2,
} from "lucide-react"
import { AnimatedBackground } from "../../components/ui/animated-background"
import { api } from "../../lib/api"
import type { AgentEvent, AgentTrace } from "../../types"

const STEP_ICONS: Record<string, any> = {
  thinking: Brain, rewriting: Sparkles, searching: Search,
  sources: FileText, generating: Zap, reflecting: Shield,
  web_search: Globe, improving: RefreshCw, done: CheckCircle2, error: AlertCircle,
}

const STEP_COLORS: Record<string, string> = {
  thinking: "#a78bfa", rewriting: "#f59e0b", searching: "#3FC9B5",
  sources: "#3FC9B5", generating: "#818cf8", reflecting: "#34d399",
  web_search: "#f97316", improving: "#f59e0b", done: "#34d399", error: "#ef4444",
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5 backdrop-blur-sm"
    >
      <div className="rounded-lg p-2.5" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-100">{value}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{label}</p>
      </div>
    </motion.div>
  )
}

function TraceTimeline({ trace }: { trace: AgentTrace }) {
  return (
    <div className="relative ml-3 border-l border-zinc-800/60 pl-5 pt-1">
      {trace.events.map((event, i) => {
        const Icon = STEP_ICONS[event.event] || Brain
        const color = STEP_COLORS[event.event] || "#a78bfa"
        return (
          <div key={i} className="relative mb-4 last:mb-0">
            <div
              className="absolute -left-[25px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border"
              style={{ borderColor: `${color}60`, background: `${color}15` }}
            >
              <Icon className="h-2.5 w-2.5" style={{ color }} />
            </div>
            <div>
              <span className="font-mono text-[11px] font-medium capitalize" style={{ color }}>
                {event.event.replace("_", " ")}
              </span>
              {event.data.message && (
                <p className="mt-0.5 text-[11px] text-zinc-500">{event.data.message}</p>
              )}
              {event.event === "rewriting" && (
                <div className="mt-1 space-y-0.5">
                  <p className="text-[11px] text-zinc-600">Original: {event.data.original}</p>
                  <p className="text-[11px] text-amber-400/80">Optimized: {event.data.optimized}</p>
                </div>
              )}
              {event.event === "sources" && (
                <p className="mt-0.5 text-[11px] text-teal-400/80">
                  {event.data.count} chunks via {event.data.method}
                </p>
              )}
              {event.event === "reflecting" && (
                <p className={`mt-0.5 text-[11px] ${event.data.passed ? "text-emerald-400/80" : "text-red-400/80"}`}>
                  {event.data.passed ? "✓ Passed" : "✗ Failed"} — {event.data.feedback}
                </p>
              )}
              {event.event === "done" && (
                <p className="mt-0.5 text-[11px] text-emerald-400/80">
                  Confidence: {Math.round((event.data.confidence || 0) * 100)}% · {event.data.reflection_loops} loops · {event.data.mode_used}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<string[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [traces, setTraces] = useState<AgentTrace[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingTraces, setLoadingTraces] = useState(false)
  const [expandedTrace, setExpandedTrace] = useState<number | null>(null)

  useEffect(() => {
    api.getAgentSessions()
      .then((data) => setSessions(data.sessions))
      .catch(() => {})
      .finally(() => setLoadingSessions(false))
  }, [])

  const loadSession = async (sessionId: string) => {
    setSelectedSession(sessionId)
    setLoadingTraces(true)
    setExpandedTrace(null)
    try {
      const data = await api.getAgentLogs(sessionId)
      setTraces(data.traces)
    } catch { setTraces([]) }
    setLoadingTraces(false)
  }

  // Compute stats from traces
  const totalQueries = traces.length
  const avgConfidence = traces.length > 0
    ? traces.reduce((sum, t) => {
        const done = t.events.find((e) => e.event === "done")
        return sum + (done?.data?.confidence || 0)
      }, 0) / traces.length
    : 0
  const webSearchCount = traces.filter((t) => t.events.some((e) => e.event === "web_search")).length
  const reflectionCount = traces.filter((t) => t.events.some((e) => e.event === "improving")).length

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0c] pb-20 font-sans text-zinc-100 selection:bg-purple-500/30">
      <AnimatedBackground />

      {/* Radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.06),transparent_60%)] blur-2xl" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-10 px-6 pt-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm tracking-tight text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> back to home
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-5">
          <div className="mt-1 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 shadow-[0_0_15px_rgba(167,139,250,0.1)]">
            <Activity className="h-7 w-7 text-purple-400/80" />
          </div>
          <div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-balance text-white">
              Agent{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-base text-zinc-500">
              Inspect the AI agent&apos;s reasoning chains, tool usage, and confidence scores.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        {selectedSession && traces.length > 0 && (
          <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Queries" value={String(totalQueries)} icon={Hash} color="#a78bfa" />
            <StatCard label="Avg Confidence" value={`${Math.round(avgConfidence * 100)}%`} icon={Shield} color="#34d399" />
            <StatCard label="Web Searches" value={String(webSearchCount)} icon={Globe} color="#f97316" />
            <StatCard label="Re-generations" value={String(reflectionCount)} icon={RefreshCw} color="#f59e0b" />
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Session list */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              Sessions · {sessions.length}
            </p>
            {loadingSessions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6 text-center">
                <Brain className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
                <p className="text-sm text-zinc-600">No sessions yet</p>
                <p className="mt-1 text-xs text-zinc-700">Start a chat to see agent traces here</p>
                <Link
                  href="/chat"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 font-mono text-xs text-purple-400 transition-colors hover:bg-purple-500/20"
                >
                  <Zap className="h-3 w-3" /> Open Chat
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sessions.map((sid) => (
                  <button
                    key={sid}
                    onClick={() => loadSession(sid)}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left font-mono text-xs transition-all ${
                      selectedSession === sid
                        ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                        : "border-zinc-800/60 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <Brain className="h-3 w-3 shrink-0" />
                    <span className="min-w-0 truncate">{sid.slice(0, 8)}...{sid.slice(-4)}</span>
                    <ChevronRight className="ml-auto h-3 w-3 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trace viewer */}
          <div className="space-y-3">
            {!selectedSession ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/20 py-20 text-center">
                <Activity className="mb-4 h-10 w-10 text-zinc-800" />
                <p className="text-sm text-zinc-600">Select a session to view agent traces</p>
              </div>
            ) : loadingTraces ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              </div>
            ) : traces.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/20 py-20 text-center">
                <AlertCircle className="mb-4 h-10 w-10 text-zinc-700" />
                <p className="text-sm text-zinc-600">No traces found for this session</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  Reasoning Traces · {traces.length}
                </p>
                {traces.map((trace, i) => {
                  const doneEvent = trace.events.find((e) => e.event === "done")
                  const isExpanded = expandedTrace === i
                  return (
                    <motion.div
                      key={i}
                      layout
                      className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm"
                    >
                      <button
                        onClick={() => setExpandedTrace(isExpanded ? null : i)}
                        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-800/30"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <span className="font-mono text-xs font-bold text-purple-400">#{i + 1}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-zinc-300">
                            {trace.events.find((e) => e.event === "rewriting")?.data?.original || "Query"}
                          </p>
                          <div className="mt-0.5 flex items-center gap-3 font-mono text-[10px] text-zinc-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" /> {trace.duration_ms}ms
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" /> {trace.event_count} steps
                            </span>
                            {doneEvent && (
                              <span
                                className="flex items-center gap-1"
                                style={{ color: (doneEvent.data.confidence || 0) >= 0.8 ? "#34d399" : "#f59e0b" }}
                              >
                                <Shield className="h-2.5 w-2.5" /> {Math.round((doneEvent.data.confidence || 0) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 text-zinc-600 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="border-t border-zinc-800/40 px-5 py-4">
                              <TraceTimeline trace={trace} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
