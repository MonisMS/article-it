"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ExternalLink, History, Loader2, Mail } from "lucide-react"
import type { DigestLogArticle, DigestLogRow } from "@/lib/db/queries/history"
import { monthLabel } from "@/lib/utils"

function formatSentAt(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function groupByMonth(logs: DigestLogRow[]): { month: string; logs: DigestLogRow[] }[] {
  const map = new Map<string, DigestLogRow[]>()
  for (const log of logs) {
    const key = monthLabel(log.sentAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(log)
  }
  return Array.from(map.entries()).map(([month, groupedLogs]) => ({ month, logs: groupedLogs }))
}

function DigestRow({ log, index }: { log: DigestLogRow; index: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState<DigestLogArticle[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    if (open) {
      setOpen(false)
      return
    }

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.28 }}
      className="rounded-[1.4rem] border border-stone-200/80 bg-white/80 dark:border-[#1E2A3A] dark:bg-[#121925]/75"
    >
      <button
        onClick={toggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-stone-50/70 dark:hover:bg-[#161F2B]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl dark:bg-[#1E2533]">
          {log.topic.icon ?? "*"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6]">{log.topic.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
              isSent
                ? "bg-stone-100 text-stone-600 dark:bg-[#1E2533] dark:text-[#B8C0CC]"
                : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-300"
            }`}>
              {isSent ? "Sent" : "Failed"}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-400 dark:text-[#6B7585]">{formatSentAt(log.sentAt)}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585] sm:block">
            {log.articleCount} articles
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-stone-400 dark:text-[#6B7585]" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 px-5 py-4 dark:border-[#1E2A3A]">
              {loading && (
                <div className="flex items-center gap-2 py-2 text-sm text-stone-400 dark:text-[#6B7585]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading articles...
                </div>
              )}
              {error && <p className="py-2 text-sm text-red-500">{error}</p>}
              {articles?.length === 0 && (
                <p className="py-2 text-sm text-stone-400 dark:text-[#6B7585]">No articles recorded for this digest.</p>
              )}
              {articles && articles.length > 0 && (
                <ul className="space-y-2">
                  {articles.map((article, articleIndex) => (
                    <motion.li
                      key={article.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: articleIndex * 0.02, duration: 0.2 }}
                      className="group flex items-start justify-between gap-4 rounded-xl px-2 py-2 transition-colors hover:bg-stone-50 dark:hover:bg-[#161F2B]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-stone-800 transition-colors group-hover:text-stone-900 dark:text-[#E8E3DA] dark:group-hover:text-[#F0EDE6]">
                          {article.title}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-400 dark:text-[#6B7585]">{article.sourceName}</p>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone-300 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:text-[#6B7585] dark:hover:bg-[#1E2533] dark:hover:text-[#C8C4BC]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
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

export function HistoryClient({
  logs,
  hasMore,
  page,
  totalDigests,
  totalArticles,
}: {
  logs: DigestLogRow[]
  hasMore: boolean
  page: number
  totalDigests: number
  totalArticles: number
}) {
  if (logs.length === 0) {
    return (
      <div className="px-4 py-24 text-center sm:px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-100 dark:bg-[#1E2533]">
            <History className="h-9 w-9 text-stone-500 dark:text-[#8A95A7]" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 dark:text-[#E8E3DA]">No digests yet</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-stone-400 dark:text-[#6B7585]">
            Once your first digest is sent, it will appear here with everything that was inside.
          </p>
          <Link
            href="/profile?tab=digests"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-[#F0EDE6] dark:text-[#0D1117]"
          >
            <Mail className="h-4 w-4" />
            Set up digest
          </Link>
        </motion.div>
      </div>
    )
  }

  const groups = groupByMonth(logs)

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200/80 pb-4 dark:border-[#1E2A3A]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
            Archive
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6]">
            Delivery summary
          </h2>
        </div>
        <div className="flex flex-wrap gap-5">
          <div>
            <div className="text-lg font-semibold text-stone-900 dark:text-[#F0EDE6]">{totalDigests}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">Digests</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-stone-900 dark:text-[#F0EDE6]">{totalArticles}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">Articles</div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {groups.map(({ month, logs: monthLogs }) => (
          <section key={month}>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">{month}</span>
              <div className="h-px flex-1 bg-stone-200/70 dark:bg-[#1E2A3A]" />
            </div>
            <div className="space-y-2.5">
              {monthLogs.map((log, index) => (
                <DigestRow key={log.id} log={log} index={index} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-stone-200/80 pt-6 dark:border-[#1E2A3A]">
        <a
          href={`/history?page=${Math.max(0, page - 1)}`}
          className={`rounded-xl border border-stone-200/80 bg-white px-5 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#B8C0CC] dark:hover:border-[#2D3B4F] dark:hover:bg-[#1E2533] ${page === 0 ? "pointer-events-none opacity-30" : ""}`}
        >
          &larr; Previous
        </a>
        <span className="text-sm text-stone-400 dark:text-[#6B7585]">Page {page + 1}</span>
        <a
          href={`/history?page=${page + 1}`}
          className={`rounded-xl border border-stone-200/80 bg-white px-5 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#B8C0CC] dark:hover:border-[#2D3B4F] dark:hover:bg-[#1E2533] ${!hasMore ? "pointer-events-none opacity-30" : ""}`}
        >
          Next &rarr;
        </a>
      </div>
    </div>
  )
}
