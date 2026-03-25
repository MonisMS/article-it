"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink, Loader2 } from "lucide-react"
import type { DigestLogRow, DigestLogArticle } from "@/lib/db/queries/history"

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function HistoryLogRow({ log }: { log: DigestLogRow }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState<DigestLogArticle[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    if (open) { setOpen(false); return }
    setOpen(true)
    if (articles !== null) return

    setLoading(true)
    try {
      const res = await fetch(`/api/user/digest-history/${log.id}`)
      const { data, error } = await res.json()
      if (error) throw new Error(error)
      setArticles(data.articles)
    } catch {
      setError("Failed to load articles.")
    } finally {
      setLoading(false)
    }
  }

  const isSent = log.status === "sent"

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{log.topic.icon ?? "📰"}</span>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{log.topic.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{formatDate(log.sentAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-zinc-500 hidden sm:block">{log.articleCount} articles</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isSent ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}>
            {isSent ? "Sent" : "Failed"}
          </span>
          {open
            ? <ChevronUp className="w-4 h-4 text-zinc-400" />
            : <ChevronDown className="w-4 h-4 text-zinc-400" />
          }
        </div>
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-5 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {articles?.length === 0 && (
            <p className="text-sm text-zinc-400">No articles recorded for this digest.</p>
          )}
          {articles && articles.length > 0 && (
            <ul className="space-y-3">
              {articles.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{a.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{a.sourceName}</p>
                  </div>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
