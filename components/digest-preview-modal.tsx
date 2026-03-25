"use client"

import { useState } from "react"
import { Eye, X, Loader2 } from "lucide-react"

type Props = {
  topicId: string
  topicName: string
  topicIcon: string | null
}

export function DigestPreviewModal({ topicId, topicName, topicIcon }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState<string | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function openPreview() {
    setOpen(true)
    if (html !== null) return // already loaded

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/user/digest-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      })
      const { data, error } = await res.json()
      if (error) throw new Error(error)
      setSubject(data.subject)
      setHtml(data.html)
    } catch {
      setError("Failed to load preview.")
    } finally {
      setLoading(false)
    }
  }

  function close() {
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={openPreview}
        title={`Preview ${topicName} digest`}
        className="flex items-center justify-center w-5 h-5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
      >
        <Eye className="w-3 h-3" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={close} />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-0.5">Email preview</p>
                <p className="text-sm font-semibold text-zinc-900 truncate">
                  {topicIcon ?? "📰"} {subject ?? `${topicName} digest`}
                </p>
              </div>
              <button
                onClick={close}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors flex-shrink-0 ml-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden">
              {loading && (
                <div className="flex items-center justify-center gap-2 h-64 text-sm text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Rendering preview…
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center h-64 text-sm text-red-500">{error}</div>
              )}
              {html && (
                <iframe
                  srcDoc={html}
                  sandbox="allow-same-origin"
                  className="w-full h-[600px] border-none"
                  title="Digest email preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
