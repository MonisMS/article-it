"use client"

import { useState } from "react"
import { Eye, Loader2, X } from "lucide-react"

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
    if (html !== null) return

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
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#B8C0CC] dark:hover:border-[#2D3B4F] dark:hover:text-[#F0EDE6]"
      >
        <Eye className="h-3.5 w-3.5" />
        Preview
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35" onClick={close} />

          <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-xl dark:border-[#1E2A3A] dark:bg-[#161C26]">
            <div className="flex items-center justify-between border-b border-stone-200/80 px-5 py-4 dark:border-[#1E2A3A]">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-[#6B7585]">
                  Email preview
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-stone-900 dark:text-[#F0EDE6]">
                  {topicIcon ? `${topicIcon} ` : ""}{subject ?? `${topicName} digest`}
                </p>
              </div>
              <button
                onClick={close}
                className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-[#6B7585] dark:hover:bg-[#1E2533] dark:hover:text-[#F0EDE6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {loading && (
                <div className="flex h-64 items-center justify-center gap-2 text-sm text-stone-400 dark:text-[#6B7585]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Rendering preview...
                </div>
              )}
              {error && <div className="flex h-64 items-center justify-center text-sm text-red-500">{error}</div>}
              {html && (
                <iframe
                  srcDoc={html}
                  sandbox="allow-same-origin"
                  className="h-[600px] w-full border-none"
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
