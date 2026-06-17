"use client"

import type React from "react"

import { useRef, useState, useCallback } from "react"
import {
  ArrowLeft,
  Database,
  Upload,
  FileText,
  SplitSquareHorizontal,
  Network,
  HardDrive,
  X,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

type UploadedFile = {
  id: string
  name: string
  size: number
}

const PIPELINE = [
  { step: "01", label: "PARSE", desc: "Extract text & metadata from raw files", Icon: FileText, color: "amber" },
  { step: "02", label: "CHUNK", desc: "Split into overlapping semantic windows", Icon: SplitSquareHorizontal, color: "teal" },
  { step: "03", label: "EMBED", desc: "Generate dense vector representations", Icon: Network, color: "purple" },
  { step: "04", label: "INDEX", desc: "Write to vector & BM25 stores", Icon: HardDrive, color: "blue" },
] as const

const COLOR_MAP: Record<string, { border: string; text: string; icon: string }> = {
  amber: { border: "hover:border-amber-500/40", text: "text-amber-500", icon: "text-amber-500/80" },
  teal: { border: "hover:border-teal-500/40", text: "text-teal-400", icon: "text-teal-400/80" },
  purple: { border: "hover:border-purple-500/40", text: "text-purple-400", icon: "text-purple-400/80" },
  blue: { border: "hover:border-blue-400/40", text: "text-blue-400", icon: "text-blue-400/80" },
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])

  const addFiles = useCallback((fileList: FileList) => {
    const incoming = Array.from(fileList).map((f) => ({
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      size: f.size,
    }))
    setFiles((prev) => [...prev, ...incoming])
  }, [])

  const handleBrowseClick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b] pb-20 font-sans text-zinc-100 selection:bg-purple-500/30">
      <div className="pointer-events-none absolute inset-0 z-0 border-t border-zinc-800/30 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.08),transparent_60%)] blur-2xl" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-12 px-6 pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm tracking-tight text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> back to home
        </Link>

        <div className="flex items-start gap-5">
          <div className="mt-1 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <Database className="h-7 w-7 text-teal-400/80" />
          </div>
          <div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-balance text-white">
              Knowledge{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Base
              </span>
            </h1>
            <p className="text-base text-zinc-500">
              Upload documents to expand the AI&apos;s searchable memory.
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setIsDragging(false)
          }}
          onDrop={handleDrop}
          className={`group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-20 transition-all duration-300 ${
            isDragging
              ? "border-teal-400/60 bg-teal-500/[0.04] shadow-[0_0_40px_rgba(20,184,166,0.12)]"
              : "border-zinc-800 bg-[#0c0c0e]/50 hover:border-zinc-700 hover:bg-[#0c0c0e]"
          }`}
        >
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            <div className={`absolute inset-0 rounded-full border border-zinc-800 transition-transform duration-500 ${isDragging ? "scale-125" : "group-hover:scale-110"}`} />
            <div className={`absolute inset-2 rounded-full border border-zinc-700/50 transition-transform duration-500 ${isDragging ? "scale-110" : "group-hover:scale-105"}`} />
            <div className="relative rounded-full border border-zinc-700 bg-zinc-900 p-4 shadow-lg">
              <Upload className={`h-6 w-6 transition-transform duration-300 ${isDragging ? "-translate-y-0.5 text-teal-300" : "text-teal-400"}`} />
            </div>
          </div>

          <h3 className="mb-6 text-lg font-medium text-zinc-200">
            {isDragging ? "Release to upload" : "Drop your files here"}
          </h3>

          <div className="mb-8 flex gap-3">
            {["PDF", "DOCX", "TXT", "MD"].map((ext) => (
              <span key={ext} className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-zinc-400">
                {ext}
              </span>
            ))}
          </div>

          <div className="mb-8 flex w-full max-w-xs items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="font-mono text-xs text-zinc-600">or</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept=".pdf,.docx,.txt,.md" />

          <button onClick={handleBrowseClick} className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-transparent px-6 py-2.5 font-mono text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white">
            <span className="text-zinc-500">$</span> browse files
          </button>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">Queued · {files.length}</p>
              <button onClick={() => setFiles([])} className="font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-300">clear all</button>
            </div>
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id} className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-[#0c0c0e] px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400/80" />
                  <span className="truncate text-sm text-zinc-300">{file.name}</span>
                  <span className="ml-auto shrink-0 font-mono text-xs text-zinc-600">{formatBytes(file.size)}</span>
                  <button onClick={() => removeFile(file.id)} aria-label={`Remove ${file.name}`} className="shrink-0 rounded-md p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-200">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-8">
          <p className="mb-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">Processing Pipeline</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {PIPELINE.map(({ step, label, desc, Icon, color }, i) => {
              const c = COLOR_MAP[color]
              return (
                <div key={step} className="relative">
                  <div className={`group h-full rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-5 transition-colors ${c.border}`}>
                    <div className="mb-4 font-mono text-[10px] text-zinc-600">{step}</div>
                    <Icon className={`mb-4 h-5 w-5 transition-transform group-hover:scale-110 ${c.icon}`} />
                    <h4 className={`mb-2 font-mono text-xs font-semibold tracking-wide ${c.text}`}>{label}</h4>
                    <p className="text-xs leading-relaxed text-zinc-500">{desc}</p>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ChevronRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-zinc-700 md:block" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}