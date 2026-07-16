"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import type { Message } from "../../types"
import SourceCard from "./SourceCard"

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-[85%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: "rgba(157,124,255,0.1)",
              border: "0.5px solid rgba(157,124,255,0.25)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-violet" />
          </span>
        )}

        <div
          className={`rounded-2xl px-5 py-4 ${
            isUser
              ? "bg-accent-violet/90 text-white"
              : "border border-border bg-surface text-ink-muted"
          }`}
        >
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</div>

          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 border-t border-border-faint pt-4">
              <span className="font-mono-jb text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Sources retrieved · {message.sources.length}
              </span>
              <div className="grid grid-cols-1 gap-2">
                {message.sources.map((source, i) => (
                  <SourceCard key={source.id} source={source} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}