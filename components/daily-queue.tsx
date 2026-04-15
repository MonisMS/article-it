"use client"

import { useState } from "react"
import { CheckCircle2, Circle, ExternalLink } from "lucide-react"
import type { ArticleCardData } from "@/components/article-card"
import { readingTime } from "@/lib/utils"

type Props = {
  initialArticles: ArticleCardData[]
}

export function DailyQueue({ initialArticles }: Props) {
  const total = initialArticles.length
  const [readSet, setReadSet] = useState<Set<string>>(
    () => new Set(initialArticles.filter((article) => article.isRead).map((article) => article.id))
  )

  const readCount = readSet.size
  const allRead = readCount >= total
  const preview = initialArticles.slice(0, 5)

  async function toggle(id: string) {
    const wasRead = readSet.has(id)
    setReadSet((prev) => {
      const next = new Set(prev)
      if (wasRead) {
        next.delete(id)
      } else {
        next.add(id)
      }
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
      setReadSet((prev) => {
        const next = new Set(prev)
        if (wasRead) {
          next.add(id)
        } else {
          next.delete(id)
        }
        return next
      })
    }
  }

  if (total === 0) return null

  return (
    <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/75 p-5 shadow-[0_12px_40px_rgba(28,25,23,0.04)] dark:border-[#1E2A3A] dark:bg-[#121925]/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
            Today&apos;s queue
          </p>
          <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-[#F0EDE6]">
            A short list worth finishing
          </h2>
        </div>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:bg-[#1E2533] dark:text-[#8A95A7]">
          {allRead ? "Complete" : `${readCount}/${total} read`}
        </span>
      </div>

      <div className="mt-4">
        {allRead ? (
          <p className="text-sm leading-6 text-stone-500 dark:text-[#8A95A7]">
            Queue complete. Come back tomorrow for a fresh batch.
          </p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-[#1A2233]">
            {preview.map((article) => {
              const isRead = readSet.has(article.id)

              return (
                <div
                  key={article.id}
                  className={`group flex items-start gap-3 py-3.5 transition-colors ${isRead ? "opacity-55" : "hover:bg-stone-50/40 dark:hover:bg-[#0F1621]/40"}`}
                >
                  <button
                    onClick={() => toggle(article.id)}
                    className="mt-0.5 shrink-0 rounded-full text-stone-300 transition-colors hover:text-stone-500 dark:text-[#2A3547] dark:hover:text-[#6B7585]"
                    aria-label={isRead ? "Mark unread" : "Mark read"}
                  >
                    {isRead
                      ? <CheckCircle2 className="h-[15px] w-[15px] text-stone-400 dark:text-[#4A5568]" />
                      : <Circle className="h-[15px] w-[15px]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`line-clamp-2 text-[15px] font-medium leading-6 transition-colors hover:text-amber-600 dark:hover:text-[#E8A838] ${isRead ? "text-stone-400 dark:text-[#4A5568]" : "text-stone-800 dark:text-[#F0EDE6]"}`}
                    >
                      {article.title}
                    </a>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-stone-400 dark:text-[#6B7585]">
                      <span>{article.source.name}</span>
                      {article.description && (
                        <>
                          <span className="text-stone-200 dark:text-[#2A3547]">&bull;</span>
                          <span>{readingTime(article.description)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 shrink-0 text-stone-300 opacity-0 transition-all hover:text-stone-500 group-hover:opacity-100 dark:text-[#2A3547]"
                    aria-label="Open article"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {!allRead && total > preview.length && (
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">
          +{total - preview.length} more in today&apos;s queue
        </p>
      )}
    </div>
  )
}
