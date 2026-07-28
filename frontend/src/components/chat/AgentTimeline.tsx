"use client"

import { useState, useEffect } from "react"
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
  ShieldCheck,
} from "lucide-react"
import type { AgentEvent, AgentInfo } from "../../types"

const STEP_CONFIG: Record<string, { icon: any; label: string; color: string; glow: string }> = {
  orchestrating: { icon: Brain,        label: "Orchestrating",      color: "#9D7CFF", glow: "shadow-purple-500/20" },
  delegating:  { icon: Brain,        label: "Delegating Task",    color: "#9D7CFF", glow: "shadow-purple-500/20" },
  critique:    { icon: ShieldCheck,  label: "Critiquing",         color: "#ef4444", glow: "shadow-red-500/20" },
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
    case "orchestrating":
      return (
        <div className="mt-1.5 space-y-1">
          {d.plan && d.plan.map((step: any, idx: number) => (
            <p key={idx} className="text-[11px] text-zinc-500">
              <span className="text-zinc-600">{idx + 1}. {step.agent}:</span> {step.task}
            </p>
          ))}
          {d.message && <p className="text-[11px] text-zinc-500">{d.message}</p>}
        </div>
      )
    case "delegating":
      return (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="text-[#9D7CFF]">Orchestrator</span>
          <motion.div
             initial={{ x: -2, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ repeat: Infinity, duration: 1.5 }}
          >
             →
          </motion.div>
          <span style={{ color: d.target?.color || "#fff" }}>{d.target?.name || "Agent"}</span>
        </div>
      )
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
  const [now, setNow] = useState(Date.now())
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())
  const [userToggled, setUserToggled] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!isStreaming) return
    const interval = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(interval)
  }, [isStreaming])

  if (events.length === 0 && !isStreaming) return null

  const getIsExpanded = (i: number) => {
    if (userToggled.has(i)) return expandedSteps.has(i)
    return i >= events.length - 2
  }

  const toggleStep = (i: number) => {
    const currentlyExpanded = getIsExpanded(i)
    setUserToggled((prev) => new Set(prev).add(i))
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (currentlyExpanded) next.delete(i)
      else next.add(i)
      return next
    })
  }

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
            const isExpanded = getIsExpanded(i)
            
            let durationMs = 0
            const nextEvent = events[i + 1]
            if (nextEvent && nextEvent.timestamp && event.timestamp) {
              durationMs = nextEvent.timestamp - event.timestamp
            } else if (isActive && event.timestamp) {
              durationMs = Math.max(0, now - event.timestamp)
            }
            const durationStr = durationMs > 0 ? `${(durationMs / 1000).toFixed(1)}s` : null

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
                      ? `animate-pulse shadow-sm ${config.glow}`
                      : event.event === "error"
                      ? "border-red-500/40 bg-red-500/10"
                      : event.event === "done"
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-zinc-700 bg-zinc-800/80"
                  }`}
                  style={isActive ? { borderColor: config.color, backgroundColor: `${config.color}20` } : {}}
                >
                  {isActive ? (
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                  ) : (
                    <Icon className="h-2.5 w-2.5" style={{ color: config.color }} />
                  )}
                </div>

                <div>
                  <div 
                    className="flex items-center gap-2 cursor-pointer select-none" 
                    onClick={() => toggleStep(i)}
                  >
                    <span className="text-[10px] text-zinc-500 w-2 text-center">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                    <span
                      className="font-mono text-[11px] font-medium"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                    {durationStr && (
                      <span className="text-[10px] text-zinc-600 font-mono">
                        · {durationStr}
                      </span>
                    )}
                    {event.data.agent && (
                      <div className="flex items-center gap-1 border border-zinc-800 rounded px-1.5 py-[1px] bg-zinc-900/50 ml-1">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: event.data.agent.color }} />
                        <span className="text-[9px] text-zinc-400 font-mono">{event.data.agent.name}</span>
                      </div>
                    )}
                  </div>
                  {isExpanded && <EventDetail event={event} />}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
