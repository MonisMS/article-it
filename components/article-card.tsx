"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { BookmarkButton } from "@/components/bookmark-button"
import { ReadButton } from "@/components/read-button"

type Topic = { id: string; name: string; icon: string | null; slug: string }

export type ArticleCardData = {
  id: string
  title: string
  url: string
  description: string | null
  imageUrl?: string | null
  publishedAt: Date | null
  source: { name: string }
  articleTopics: Topic[]
  isBookmarked?: boolean
  isRead?: boolean
}

function timeAgo(date: Date | null): string {
  if (!date) return ""
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function readingTime(text: string | null): string {
  if (!text) return ""
  const words = text.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export function ArticleCard({
  article,
  onReadChange,
}: {
  article: ArticleCardData
  onReadChange?: (articleId: string, isRead: boolean) => void
}) {
  const primaryTopic = article.articleTopics[0]
  const [read, setRead] = useState(article.isRead ?? false)
  const [imgError, setImgError] = useState(false)

  const showImage = article.imageUrl && !imgError

  return (
    <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all duration-200
      ${read
        ? "bg-stone-50 dark:bg-[#0D1117] border-stone-200 dark:border-[#1E2A3A] border-l-4 border-l-stone-300 dark:border-l-[#2D3B4F]"
        : "bg-gradient-to-b from-white dark:from-[#161C26] to-stone-50/50 dark:to-[#0D1117] border-stone-200 dark:border-[#1E2A3A] hover:border-stone-300 dark:hover:border-[#2D3B4F] hover:shadow-md hover:shadow-stone-200/60 dark:hover:shadow-black/30 hover:-translate-y-0.5"
      }`}>

      {showImage ? (
        <img
          src={article.imageUrl!}
          alt=""
          onError={() => setImgError(true)}
          className="object-cover aspect-video w-full"
        />
      ) : (
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-amber-600" />
      )}

      <div className="flex flex-col gap-3 flex-1 p-5">
        {primaryTopic && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-xs font-medium text-stone-500 dark:text-[#6B7585]">{primaryTopic.name}</span>
          </div>
        )}

        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[15px] font-semibold leading-snug hover:text-amber-700 dark:hover:text-[#E8A838] transition-colors line-clamp-2
            ${read ? "text-stone-400 dark:text-[#6B7585]" : "text-stone-900 dark:text-[#F0EDE6]"}`}
        >
          {article.title}
        </Link>

        {article.description && (
          <p className="text-sm text-stone-500 dark:text-[#B8C0CC] leading-relaxed line-clamp-2">
            {article.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-100 dark:border-[#1E2A3A]">
          <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-[#6B7585]">
            <span className="font-medium text-stone-500 dark:text-[#B8C0CC]">{article.source.name}</span>
            {article.publishedAt && (
              <>
                <span>·</span>
                <span>{timeAgo(article.publishedAt)}</span>
              </>
            )}
            {article.description && (
              <>
                <span>·</span>
                <span>{readingTime(article.description)}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <ReadButton
              articleId={article.id}
              initialRead={read}
              onToggle={(isRead) => {
                setRead(isRead)
                onReadChange?.(article.id, isRead)
              }}
            />
            <BookmarkButton
              articleId={article.id}
              initialBookmarked={article.isBookmarked ?? false}
            />
            <Link
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-7 h-7 rounded-md text-stone-400 dark:text-[#6B7585] hover:text-stone-700 dark:hover:text-[#F0EDE6] hover:bg-stone-100 dark:hover:bg-[#1E2533] transition-colors"
              title="Open article"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
