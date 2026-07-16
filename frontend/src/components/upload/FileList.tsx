"use client"

import { motion } from "framer-motion"
import { FileText, Loader2, CheckCircle2, XCircle } from "lucide-react"
import type { UploadedFile, UploadStatus } from "../../types"

const STATUS_MAP: Record<UploadStatus, { label: string; color: string }> = {
  pending: { label: "queued", color: "#4A5568" },
  processing: { label: "indexing", color: "#E8A33D" },
  indexed: { label: "indexed", color: "#3FC9B5" },
  failed: { label: "failed", color: "#E5484D" },
}

export default function FileList({ files }: { files: UploadedFile[] }) {
  if (files.length === 0) {
    return <p className="text-sm text-ink-faint">No files uploaded yet.</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {files.map((file) => {
        const status = STATUS_MAP[file.status]
        return (
          <motion.li
            key={file.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <FileText className="h-4 w-4 shrink-0 text-ink-faint" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink-muted">{file.name}</p>
              {file.status === "failed" && file.error && (
                <p className="mt-0.5 text-xs text-[#E5484D]">{file.error}</p>
              )}
            </div>

            <span
              className="flex items-center gap-1.5 font-mono-jb text-[10px] uppercase tracking-[0.1em]"
              style={{ color: status.color }}
            >
              {file.status === "processing" && <Loader2 className="h-3 w-3 animate-spin" />}
              {file.status === "indexed" && <CheckCircle2 className="h-3 w-3" />}
              {file.status === "failed" && <XCircle className="h-3 w-3" />}
              {status.label}
            </span>
          </motion.li>
        )
      })}
    </ul>
  )
}
