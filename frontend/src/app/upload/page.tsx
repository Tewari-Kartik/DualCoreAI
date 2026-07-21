"use client"

import { useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  Upload,
  FileText,
  SplitSquareHorizontal,
  Network,
  HardDrive,
  X,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from "lucide-react"

type UploadedFile = {
  id: string
  name: string
  size: number
}

const PIPELINE = [
  { step: "01", label: "PARSE", desc: "Extract text & metadata from raw files", Icon: FileText, color: "teal", accent: "#3FC9B5" },
  { step: "02", label: "CHUNK", desc: "Split into overlapping semantic windows", Icon: SplitSquareHorizontal, color: "purple", accent: "#9D7CFF" },
  { step: "03", label: "EMBED", desc: "Generate dense vector representations", Icon: Network, color: "amber", accent: "#E8A33D" },
  { step: "04", label: "INDEX", desc: "Write to vector & BM25 stores", Icon: HardDrive, color: "blue", accent: "#60a5fa" },
] as const

const COLOR_MAP: Record<string, string> = {
  amber: "glow-amber border-[#E8A33D]/20 text-[#E8A33D]",
  teal: "glow-teal border-[#3FC9B5]/20 text-[#3FC9B5]",
  purple: "glow-violet border-[#9D7CFF]/20 text-[#9D7CFF]",
  blue: "glow-violet border-blue-500/20 text-blue-400",
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

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
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080B11] pb-20 pt-24 font-sans text-[#C8D0DC]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(ellipse at 80% 0%, rgba(63,201,181,0.06) 0%, transparent 50%), radial-gradient(ellipse at 20% 100%, rgba(157,124,255,0.05) 0%, transparent 40%)",
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-12 px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-5">
          <div className="mt-1 rounded-2xl border border-[#3FC9B5]/20 bg-[#3FC9B5]/5 p-4 shadow-[0_0_20px_rgba(63,201,181,0.1)]">
            <Database className="h-7 w-7 text-[#3FC9B5]" />
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#EEF1F6]">
              Knowledge <span className="bg-gradient-to-r from-[#3FC9B5] to-[#9D7CFF] bg-clip-text text-transparent">Base</span>
            </h1>
            <p className="text-[15px] text-[#4A5568]">Upload documents to expand the AI's searchable memory.</p>
          </div>
        </motion.div>

        {/* Dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          onDrop={handleDrop}
          className={`glass-card group relative flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed px-4 py-20 transition-all duration-300 ${
            isDragging
              ? "border-[#3FC9B5]/60 bg-[#3FC9B5]/[0.04] shadow-[0_0_40px_rgba(63,201,181,0.15)] scale-[1.01]"
              : "border-zinc-800 hover:border-zinc-700 hover:bg-white/[0.02]"
          }`}
        >
          {isDragging && <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#3FC9B5]/10 to-transparent blur-xl pointer-events-none" />}
          
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            <div className={`absolute inset-0 rounded-full border border-zinc-800 transition-transform duration-500 ${isDragging ? "scale-125" : "group-hover:scale-110"}`} />
            <div className={`absolute inset-3 rounded-full border border-zinc-700/50 transition-transform duration-500 ${isDragging ? "scale-110" : "group-hover:scale-105"}`} />
            <div className="relative rounded-full border border-zinc-700 bg-zinc-900 p-5 shadow-lg shadow-black/50">
              <Upload className={`h-8 w-8 transition-all duration-300 ${isDragging ? "-translate-y-1 text-[#3FC9B5]" : "text-[#4A5568] group-hover:text-zinc-300"}`} />
            </div>
          </div>

          <h3 className="mb-6 text-xl font-medium text-[#EEF1F6]">
            {isDragging ? "Release to upload" : "Drop your files here"}
          </h3>

          <div className="mb-8 flex gap-3">
            {["PDF", "DOCX", "TXT", "MD"].map((ext) => (
              <span key={ext} className="rounded-lg border border-[#1C2230] bg-[#0D1117] px-3 py-1 font-[family-name:var(--font-jetbrains)] text-xs font-semibold tracking-wider text-[#3A4455]">
                {ext}
              </span>
            ))}
          </div>

          <div className="mb-8 flex w-full max-w-xs items-center gap-4">
            <div className="h-px flex-1 bg-[#1C2230]" />
            <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[#3A4455]">or</span>
            <div className="h-px flex-1 bg-[#1C2230]" />
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept=".pdf,.docx,.txt,.md" />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBrowseClick}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#3FC9B5] to-[#25a896] px-6 py-3 font-[family-name:var(--font-jetbrains)] text-sm text-black shadow-lg shadow-teal-900/30 transition-all hover:shadow-teal-900/50"
          >
            <Sparkles className="h-4 w-4" /> browse files
          </motion.button>
        </motion.div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
              <div className="flex items-center justify-between pt-4">
                <p className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.2em] text-[#3A4455]">Queued · {files.length}</p>
                <button onClick={() => setFiles([])} className="font-[family-name:var(--font-jetbrains)] text-[11px] text-zinc-500 transition-colors hover:text-zinc-300">clear all</button>
              </div>
              <ul className="space-y-2">
                <AnimatePresence>
                  {files.map((file) => (
                    <motion.li key={file.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                      className="glass-card flex items-center gap-4 rounded-xl px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#3FC9B5]" />
                      <span className="truncate text-[14px] text-[#EEF1F6]">{file.name}</span>
                      <span className="ml-auto shrink-0 font-[family-name:var(--font-jetbrains)] text-[11px] text-[#4A5568]">{formatBytes(file.size)}</span>
                      <button onClick={() => removeFile(file.id)} aria-label={`Remove ${file.name}`} className="shrink-0 rounded-md p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-red-400">
                        <X className="h-4 w-4" />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pipeline Diagram */}
        <div className="pt-8">
          <p className="mb-8 text-center font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.2em] text-[#3A4455]">Processing Pipeline</p>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {PIPELINE.map(({ step, label, desc, Icon, color, accent }, i) => {
              const c = COLOR_MAP[color]
              return (
                <motion.div key={step} variants={fadeUp} className="relative">
                  <div className={`glass-card group h-full rounded-2xl p-5 transition-all duration-300 ${c}`}>
                    <div className="mb-4 font-[family-name:var(--font-jetbrains)] text-[10px] text-zinc-500">{step}</div>
                    <Icon className="mb-4 h-6 w-6 transition-transform group-hover:scale-110" style={{ color: accent }} />
                    <h4 className="mb-2 font-[family-name:var(--font-jetbrains)] text-[13px] font-semibold tracking-wide" style={{ color: accent }}>{label}</h4>
                    <p className="text-[12px] leading-relaxed text-[#4A5568]">{desc}</p>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ChevronRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-zinc-700 md:block" />
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </div>
  )
}