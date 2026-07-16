"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp } from "lucide-react"
import MessageBubble from "./MessageBubble"
import Loader from "../ui/Loader"
import Button from "../ui/Button"
import { api } from "../../lib/api"
import type { Message } from "../../types"

export default function ChatWindow({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isThinking) return

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: trimmed, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsThinking(true)

    try {
      const data: any = await api.chat(sessionId, trimmed)
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        sources: data.sources ?? [],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const failMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: err instanceof Error ? `Couldn't reach the retrieval engine: ${err.message}` : "Something went wrong.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, failMessage])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-2 pt-24 text-center">
              <p className="font-mono-jb text-[11px] uppercase tracking-[0.16em] text-ink-ghost">
                no messages yet
              </p>
              <p className="text-sm text-ink-faint">Ask something about your indexed documents.</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isThinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start pl-10">
              <Loader label="retrieving & reasoning" />
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask a question..."
            rows={1}
            className="max-h-40 flex-1 resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[15px] text-ink placeholder:text-ink-ghost focus:border-accent-violet/50"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isThinking} aria-label="Send message">
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
