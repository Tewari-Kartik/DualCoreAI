import { FileText } from "lucide-react"
import type { Source } from "../../types"

export default function SourceCard({ source }: { source: Source }) {
  return (
    <div className="flex gap-3 items-start bg-zinc-950 p-3 rounded-lg border border-zinc-800/50 hover:border-violet-500/50 transition-colors">
      <FileText className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-zinc-300">
          {source.source_file}
        </p>
        <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
          {source.content}
        </p>
      </div>
    </div>
  )
}