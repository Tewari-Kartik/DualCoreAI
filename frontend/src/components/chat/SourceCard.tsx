"use client"

import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import type { Source } from "../../types"

export default function SourceCard({ source, index = 0 }: { source: Source; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06, ease: "easeOut" }}
      className="group flex items-start gap-3 rounded-lg border border-border-faint bg-canvas p-3 transition-colors hover:border-[rgba(63,201,181,0.35)]"
    >
      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent-teal transition-transform group-hover:scale-110" />
      <div className="min-w-0">
        <p className="font-mono-jb text-[11px] tracking-tight text-ink-soft">{source.source_file}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-faint">{source.content}</p>
      </div>
    </motion.div>
  )
}