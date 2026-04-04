"use client"

import { useState } from "react"
import { CheckCircle2, Circle, ChevronDown, ExternalLink } from "lucide-react"
import type { ArticleCardData } from "@/components/article-card"
import { readingTime } from "@/lib/utils"

type Props = {
  initialArticles: ArticleCardData[]
}

export function DailyQueue({ initialArticles }: Props) {
  const total = initialArticles.length
  const [readSet, setReadSet] = useState<Set<string>>(
    () => new Set(initialArticles.filter((a) => a.isRead).map((a) => a.id))
  )
  const [open, setOpen] = useState(true)

  const readCount = readSet.size
  const allRead = readCount >= total

  async function toggle(id: string) {
    const wasRead = readSet.has(id)
    setReadSet((prev) => {
      const next = new Set(prev)
      wasRead ? next.delete(id) : next.add(id)
      return next
    })
    try {
      const res = await fetch("/api/user/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // Roll back on failure
      setReadSet((prev) => {
        const next = new Set(prev)
        wasRead ? next.add(id) : next.delete(id)
        return next
      })
    }
  }

  if (total === 0) return null

  return (
    <div className="mx-4 sm:mx-6 mb-8 rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 dark:hover:bg-[#1A2233] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg leading-none">📚</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-stone-800 dark:text-[#F0EDE6]">Today&apos;s Queue</p>
            {allRead ? (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">All done 🎉</p>
            ) : (
              <p className="text-xs text-stone-400 dark:text-[#6B7585]">{readCount}/{total} read</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          {!allRead && (
            <div className="w-20 h-1.5 rounded-full bg-stone-100 dark:bg-[#1E2533] overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${total > 0 ? (readCount / total) * 100 : 0}%` }}
              />
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Rows */}
      {open && (
        <div className="border-t border-stone-100 dark:border-[#1E2A3A] divide-y divide-stone-100 dark:divide-[#1E2A3A]/60">
          {allRead ? (
            <div className="px-5 py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-700 dark:text-[#C8C4BC]">Queue complete</p>
              <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5">Come back tomorrow for a fresh batch.</p>
            </div>
          ) : (
            initialArticles.map((article) => {
              const isRead = readSet.has(article.id)
              return (
                <div
                  key={article.id}
                  className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                    isRead ? "opacity-50" : "hover:bg-stone-50 dark:hover:bg-[#1A2233]"
                  }`}
                >
                  <button
                    onClick={() => toggle(article.id)}
                    className="mt-0.5 flex-shrink-0 text-stone-300 dark:text-[#2A3547] hover:text-amber-500 transition-colors"
                    aria-label={isRead ? "Mark unread" : "Mark read"}
                  >
                    {isRead
                      ? <CheckCircle2 className="w-4.5 h-4.5 text-amber-500 w-[18px] h-[18px]" />
                      : <Circle className="w-[18px] h-[18px]" />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-medium leading-snug line-clamp-1 hover:text-amber-600 transition-colors ${
                        isRead ? "text-stone-400 dark:text-[#6B7585]" : "text-stone-800 dark:text-[#F0EDE6]"
                      }`}
                    >
                      {article.title}
                    </a>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {article.articleTopics[0]?.icon && (
                        <span className="text-xs leading-none">{article.articleTopics[0].icon}</span>
                      )}
                      <span className="text-xs text-stone-400 dark:text-[#6B7585] truncate">{article.source.name}</span>
                      {article.description && (
                        <>
                          <span className="text-stone-200 dark:text-[#2A3547]">·</span>
                          <span className="text-xs text-stone-400 dark:text-[#6B7585]">
                            {readingTime(article.description)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 mt-0.5 text-stone-300 dark:text-[#2A3547] hover:text-stone-500 transition-colors"
                    aria-label="Open article"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
