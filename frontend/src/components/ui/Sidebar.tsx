"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Upload, Brain, Home } from "lucide-react"

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/upload", label: "Upload", icon: Upload },
] as const

export default function Sidebar({ onOpenMemory }: { onOpenMemory?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-16 shrink-0 flex-col items-center justify-between border-r border-border bg-surface py-5">
      <nav className="flex flex-col items-center gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                active ? "bg-accent-violet/10 text-accent-violet" : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {active && (
                <span className="absolute left-0 h-5 w-[2px] rounded-full bg-accent-violet" style={{ left: -1 }} />
              )}
            </Link>
          )
        })}
      </nav>

      {onOpenMemory && (
        <button
          onClick={onOpenMemory}
          title="Session memory"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-faint transition-colors hover:text-accent-teal"
        >
          <Brain className="h-[18px] w-[18px]" />
        </button>
      )}
    </aside>
  )
}
