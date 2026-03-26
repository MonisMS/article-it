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
        <div>
          <h2 className="text-base font-semibold text-app-text">Today&apos;s reads</h2>
          <p className="text-xs text-app-text-muted mt-0.5">
            A small queue — read them all and you&apos;re done for today.
          </p>
        </div>
        {!allRead && (
          <span className="text-xs font-medium text-app-text-subtle tabular-nums">
            {readCount}/{total} read
          </span>
        )}
      </div>

      {allRead ? (
        <div className="rounded-xl border border-app-border bg-app-surface py-10 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-success" />
          <p className="text-sm font-semibold text-app-text">You&apos;re all caught up</p>
          <p className="text-xs text-app-text-muted mt-1">
            Come back tomorrow for a fresh queue.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {initialArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onReadChange={handleReadChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
