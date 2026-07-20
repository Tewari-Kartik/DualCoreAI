"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, ChevronDown, Hash, Cpu } from "lucide-react"

interface SourceCardProps {
  file: string
  score: number
  preview: string
  method?: string
}

const METHOD_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  hybrid:      { label: "Hybrid",  color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  traditional: { label: "Vector",  color: "#3FC9B5", bg: "rgba(63,201,181,0.1)" },
  vectorless:  { label: "BM25",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  dense:       { label: "Dense",   color: "#3FC9B5", bg: "rgba(63,201,181,0.1)" },
  sparse:      { label: "Sparse",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
}

function SourceCard({ file, score, preview, method }: SourceCardProps) {
  const [open, setOpen] = useState(false)
  const badge = METHOD_BADGE[method || "hybrid"] || METHOD_BADGE.hybrid

  return (
    <motion.div
      layout
      className="overflow-hidden rounded-lg border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-zinc-800/40"
      >
        <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">{file}</span>

        {/* Method badge */}
        <span
          className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
          style={{ color: badge.color, background: badge.bg }}
        >
          {badge.label}
        </span>

        {/* Score bar */}
        <div className="flex w-12 shrink-0 items-center gap-1">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(score * 100, 100)}%`,
                background: `linear-gradient(90deg, ${badge.color}, ${badge.color}88)`,
              }}
            />
          </div>
        </div>

        <ChevronDown
          className={`h-3 w-3 shrink-0 text-zinc-600 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-zinc-800/40 px-3 py-2.5">
              <p className="text-[11px] leading-relaxed text-zinc-500">{preview}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function SourceCards({
  sources,
}: {
  sources: Array<{ file: string; score: number; preview: string; method?: string }>
}) {
  if (!sources || sources.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
        Retrieved Sources · {sources.length}
      </p>
      {sources.map((s, i) => (
        <SourceCard key={i} {...s} />
      ))}
    </div>
  )
}
