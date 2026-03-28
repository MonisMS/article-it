"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ExternalLink, History, Loader2, Mail } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { DigestLogRow, DigestLogArticle } from "@/lib/db/queries/history"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSentAt(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function monthLabel(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function groupByMonth(logs: DigestLogRow[]): { month: string; logs: DigestLogRow[] }[] {
  const map = new Map<string, DigestLogRow[]>()
  for (const log of logs) {
    const key = monthLabel(log.sentAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(log)
  }
  return Array.from(map.entries()).map(([month, logs]) => ({ month, logs }))
}

// ─── Single digest row ────────────────────────────────────────────────────────

function DigestRow({ log, index }: { log: DigestLogRow; index: number }) {
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl bg-white border border-stone-200 overflow-hidden hover:border-stone-300 hover:shadow-sm transition-all duration-200"
    >
      {/* Header button */}
      <button
        onClick={toggle}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors text-left"
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xl flex-shrink-0">
          {log.topic.icon ?? "📰"}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-stone-900">{log.topic.name}</p>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              isSent
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {isSent ? "Sent" : "Failed"}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{formatSentAt(log.sentAt)}</p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-stone-400 hidden sm:block">{log.articleCount} articles</span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-stone-400" />
          </motion.div>
        </div>
      </button>

      {/* Expanded articles */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 px-5 py-4">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-stone-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading articles…
                </div>
              )}
              {error && <p className="text-sm text-red-500 py-2">{error}</p>}
              {articles?.length === 0 && (
                <p className="text-sm text-stone-400 py-2">No articles recorded for this digest.</p>
              )}
              {articles && articles.length > 0 && (
                <ul className="space-y-2.5">
                  {articles.map((a, i) => (
                    <motion.li
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                      className="flex items-start justify-between gap-4 rounded-xl p-2.5 hover:bg-stone-50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-stone-800 line-clamp-1 group-hover:text-amber-700 transition-colors">
                          {a.title}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">{a.sourceName}</p>
                      </div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-stone-300 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function HistoryClient({
  logs,
  hasMore,
  page,
}: {
  logs: DigestLogRow[]
  hasMore: boolean
  page: number
}) {
  const totalArticles = logs.reduce((sum, l) => sum + l.articleCount, 0)

  if (logs.length === 0) {
    return (
      <div className="py-24 text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-6">
            <History className="w-9 h-9 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800">No digests yet</h2>
          <p className="text-stone-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            Once your first digest is sent, it'll appear here with everything that was inside.
          </p>
          <Link
            href="/settings"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
            Set up digest
          </Link>
        </motion.div>
      </div>
    )
  }

  const groups = groupByMonth(logs)

  return (
    <div className="px-4 sm:px-6 pb-10">
      {/* Stats */}
      {page === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          <div className="rounded-2xl bg-white border border-stone-200 px-5 py-4">
            <p className="text-2xl font-bold text-stone-900">{logs.length}</p>
            <p className="text-xs text-stone-400 mt-0.5">digests sent</p>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 px-5 py-4">
            <p className="text-2xl font-bold text-stone-900">{totalArticles}</p>
            <p className="text-xs text-stone-400 mt-0.5">articles delivered</p>
          </div>
        </motion.div>
      )}

      {/* Timeline grouped by month */}
      <div className="flex flex-col gap-8">
        {groups.map(({ month, logs: groupLogs }) => (
          <div key={month}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">{month}</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>
            <div className="flex flex-col gap-2.5">
              {groupLogs.map((log, i) => (
                <DigestRow key={log.id} log={log} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-stone-100">
        <a
          href={`/history?page=${Math.max(0, page - 1)}`}
          className={`rounded-xl border border-stone-200 bg-white px-5 py-2 text-sm font-medium text-stone-500 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm ${page === 0 ? "pointer-events-none opacity-30" : ""}`}
        >
          ← Previous
        </a>
        <span className="text-sm text-stone-400">Page {page + 1}</span>
        <a
          href={`/history?page=${page + 1}`}
          className={`rounded-xl border border-stone-200 bg-white px-5 py-2 text-sm font-medium text-stone-500 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm ${!hasMore ? "pointer-events-none opacity-30" : ""}`}
        >
          Next →
        </a>
      </div>
    </div>
  )
}
