"use client"

import { useState, useCallback } from "react"
import { UploadCloud, Loader2 } from "lucide-react"
import { api } from "../../lib/api"
import type { UploadResponse } from "../../types"

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null)

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await uploadFile(file)
  }, [])

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setLoading(true)
    setMessage(null)
    try {
      // Calls the API client we built earlier
      const res = await api.upload(file) as UploadResponse
      setMessage({ 
        text: `Success! ${res.filename} indexed into ${res.chunks_created || 'multiple'} chunks.`, 
        type: "success" 
      })
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message}`, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200 ${
        isDragging 
          ? "border-teal-500 bg-teal-500/10 scale-[1.02]" 
          : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"
      }`}
    >
      <input type="file" id="file-upload" className="hidden" onChange={handleSelect} accept=".txt,.pdf,.docx" />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-5">
        {loading ? (
          <Loader2 className="w-14 h-14 text-teal-500 animate-spin" />
        ) : (
          <div className="p-4 bg-zinc-950 rounded-full border border-zinc-800">
            <UploadCloud className="w-8 h-8 text-teal-400" />
          </div>
        )}
        
        <div>
          <p className="text-xl font-medium text-zinc-200">
            {isDragging ? "Drop document here" : "Click to browse or drag file here"}
          </p>
          <p className="text-sm text-zinc-500 mt-2">Supports TXT, PDF, and DOCX</p>
        </div>
      </label>

      {message && (
        <div className={`mt-8 p-4 rounded-xl text-sm font-medium inline-block ${
          message.type === "success" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}