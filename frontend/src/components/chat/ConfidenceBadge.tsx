"use client"

import { motion } from "framer-motion"
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"

export default function ConfidenceBadge({
  confidence,
  reflectionLoops = 0,
}: {
  confidence: number
  reflectionLoops?: number
}) {
  const pct = Math.round(confidence * 100)
  const isHigh = pct >= 80
  const isMed = pct >= 50 && pct < 80

  const color = isHigh ? "#34d399" : isMed ? "#f59e0b" : "#ef4444"
  const bg = isHigh ? "rgba(52,211,153,0.08)" : isMed ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)"
  const Icon = isHigh ? ShieldCheck : isMed ? Shield : ShieldAlert
  const label = isHigh ? "High confidence" : isMed ? "Medium confidence" : "Low confidence"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
      style={{
        borderColor: `${color}33`,
        background: bg,
      }}
    >
      <Icon className="h-3 w-3" style={{ color }} />
      <span className="font-mono text-[10px]" style={{ color }}>
        {pct}%
      </span>
      <span className="text-[10px] text-zinc-600">
        · {reflectionLoops} loop{reflectionLoops !== 1 ? "s" : ""}
      </span>
    </motion.div>
  )
}
