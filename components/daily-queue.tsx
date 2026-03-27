"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"

type Props = {
  initialArticles: ArticleCardData[]
}

export function DailyQueue({ initialArticles }: Props) {
  const total = initialArticles.length
  const [readCount, setReadCount] = useState(0)

  const allRead = readCount >= total

  function handleReadChange(_: string, isRead: boolean) {
    setReadCount((prev) => (isRead ? prev + 1 : Math.max(0, prev - 1)))
  }

  return (
    <div className="mx-4 sm:mx-6 mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <span className="text-base">📚</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-800">Today&apos;s Queue</h2>
            <p className="text-xs text-stone-400">Read these and you&apos;re done for today</p>
          </div>
        </div>
        {!allRead && (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${total > 0 ? (readCount / total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs font-medium text-stone-500 tabular-nums">{readCount}/{total}</span>
          </div>
        )}
      </div>

      {allRead ? (
        <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <p className="text-sm font-semibold text-stone-800">Queue complete 🎉</p>
          <p className="text-xs text-stone-500 mt-1">Come back tomorrow for a fresh batch.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory">
          {initialArticles.map((article) => (
            <div key={article.id} className="snap-start flex-shrink-0 w-72">
              <ArticleCard article={article} onReadChange={handleReadChange} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
