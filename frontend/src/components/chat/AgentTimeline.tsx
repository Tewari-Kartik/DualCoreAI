"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Search,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Globe,
  RefreshCw,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react"
import type { AgentEvent } from "../../types"

const STEP_CONFIG: Record<string, { icon: any; label: string; color: string; glow: string }> = {
  thinking:    { icon: Brain,        label: "Thinking",           color: "#a78bfa", glow: "shadow-purple-500/20" },
  rewriting:   { icon: Sparkles,     label: "Rewriting Query",    color: "#f59e0b", glow: "shadow-amber-500/20" },
  searching:   { icon: Search,       label: "Retrieving",         color: "#3FC9B5", glow: "shadow-teal-500/20" },
  sources:     { icon: FileText,     label: "Sources Found",      color: "#3FC9B5", glow: "shadow-teal-500/20" },
  generating:  { icon: Zap,          label: "Generating",         color: "#818cf8", glow: "shadow-indigo-500/20" },
  reflecting:  { icon: CheckCircle2, label: "Self-Reflecting",    color: "#34d399", glow: "shadow-emerald-500/20" },
  web_search:  { icon: Globe,        label: "Web Search",         color: "#f97316", glow: "shadow-orange-500/20" },
  improving:   { icon: RefreshCw,    label: "Improving",          color: "#f59e0b", glow: "shadow-amber-500/20" },
  done:        { icon: CheckCircle2, label: "Complete",           color: "#34d399", glow: "shadow-emerald-500/20" },
  error:       { icon: AlertCircle,  label: "Error",              color: "#ef4444", glow: "shadow-red-500/20" },
}

function EventDetail({ event }: { event: AgentEvent }) {
  const d = event.data
  switch (event.event) {
    case "rewriting":
      return (
        <div className="mt-1.5 space-y-1">
          <p className="text-[11px] text-zinc-500">
            <span className="text-zinc-600">Original:</span> {d.original}
          </p>
          <p className="text-[11px] text-amber-400/80">
            <span className="text-zinc-600">Optimized:</span> {d.optimized}
          </p>
        </div>
      )
    case "sources":
      return (
        <p className="mt-1 text-[11px] text-zinc-500">
          {d.count} chunks via <span className="text-teal-400">{d.method}</span>
        </p>
      )
    case "reflecting":
      return (
        <p className={`mt-1 text-[11px] ${d.passed ? "text-emerald-400/80" : "text-red-400/80"}`}>
          {d.passed ? "✓ Answer verified" : `✗ ${d.feedback}`} · Loop {d.loop + 1}
        </p>
      )
    case "web_search":
      return <p className="mt-1 text-[11px] text-orange-400/80">Query: {d.query}</p>
    case "error":
      return <p className="mt-1 text-[11px] text-red-400/80">{d.message}</p>
    case "done":
      return (
        <p className="mt-1 text-[11px] text-emerald-400/80">
          Confidence: {Math.round((d.confidence || 0) * 100)}% · {d.reflection_loops} reflection loop(s)
        </p>
      )
    default:
      return d.message ? (
        <p className="mt-1 text-[11px] text-zinc-500">{d.message}</p>
      ) : null
  }
}

export default function AgentTimeline({
  events,
  isStreaming,
}: {
  events: AgentEvent[]
  isStreaming: boolean
}) {
  if (events.length === 0 && !isStreaming) return null

  return (
    <div className="flex flex-col gap-0.5">
      <div className="mb-3 flex items-center gap-2">
        <Brain className="h-3.5 w-3.5 text-purple-400" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Agent Reasoning
        </span>
        {isStreaming && (
          <Loader2 className="ml-auto h-3 w-3 animate-spin text-purple-400" />
        )}
      </div>

      <div className="relative ml-2 border-l border-zinc-800/60 pl-4">
        <AnimatePresence mode="popLayout">
          {events.map((event, i) => {
            const config = STEP_CONFIG[event.event] || STEP_CONFIG.thinking
            const Icon = config.icon
            const isLast = i === events.length - 1
            const isActive = isLast && isStreaming && event.event !== "done"

            return (
              <motion.div
                key={`${event.event}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-3 last:mb-0"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[21px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                    isActive
                      ? "border-purple-500/50 bg-purple-500/20"
                      : event.event === "error"
                      ? "border-red-500/40 bg-red-500/10"
                      : event.event === "done"
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-zinc-700 bg-zinc-800/80"
                  }`}
                >
                  {isActive ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" style={{ color: config.color }} />
                  ) : (
                    <Icon className="h-2.5 w-2.5" style={{ color: config.color }} />
                  )}
                </div>

                <div>
                  <span
                    className="font-mono text-[11px] font-medium"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </span>
                  <EventDetail event={event} />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
