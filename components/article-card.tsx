"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { BookmarkButton } from "@/components/bookmark-button"
import { ReadButton } from "@/components/read-button"
import { readingTime, timeAgo } from "@/lib/utils"

type Topic = { id: string; name: string; icon: string | null; slug: string }

export type ArticleCardData = {
  id: string
  title: string
  url: string
  description: string | null
  imageUrl?: string | null
  publishedAt: Date | null
  source: { name: string; qualityScore?: number | null }
  articleTopics: Topic[]
  isBookmarked?: boolean
  isRead?: boolean
}

export function ArticleCard({
  article,
  onReadChange,
  variant = "default",
}: {
  article: ArticleCardData
  onReadChange?: (articleId: string, isRead: boolean) => void
  variant?: "default" | "editorial"
}) {
  const primaryTopic = article.articleTopics[0]
  const [read, setRead] = useState(article.isRead ?? false)
  const [imgError, setImgError] = useState(false)

  const showImage = article.imageUrl && !imgError
  const isEditorial = variant === "editorial"

  return (
    <div
      className={
        isEditorial
          ? `group relative flex items-start gap-4 rounded-[1.4rem] border border-transparent px-4 py-5 transition-colors ${read ? "opacity-60" : "hover:border-stone-200/80 hover:bg-white/75 dark:hover:border-[#1E2A3A] dark:hover:bg-[#121925]/70"}`
          : `group flex items-start gap-4 border-b border-stone-100 px-1 py-4 transition-colors ${read ? "opacity-50" : "hover:bg-stone-50/60 dark:hover:bg-[#0F1621]/60"} dark:border-[#1E2A3A]`
      }
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">
          {primaryTopic && (
            <>
              <span className="font-semibold text-stone-500 dark:text-[#8A95A7]">
                {primaryTopic.icon ? `${primaryTopic.icon} ` : ""}{primaryTopic.name}
              </span>
              <span className="text-stone-200 dark:text-[#2A3547]">&bull;</span>
            </>
          )}
          <span>{article.source.name}</span>
          {(article.source.qualityScore ?? 0) >= 0.75 && (
            <span
              title="Frequently bookmarked source"
              className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-amber-700 dark:bg-[#2A3547] dark:text-[#E8A838]"
            >
              Saved often
            </span>
          )}
          {article.publishedAt && (
            <>
              <span className="text-stone-200 dark:text-[#2A3547]">&bull;</span>
              <span>{timeAgo(article.publishedAt)}</span>
            </>
          )}
          {article.description && (
            <>
              <span className="text-stone-200 dark:text-[#2A3547]">&bull;</span>
              <span>{readingTime(article.description)}</span>
            </>
          )}
        </div>

        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${isEditorial ? "text-lg leading-[1.35] sm:text-[1.2rem]" : "text-[15px] leading-snug"} line-clamp-2 font-semibold transition-colors hover:text-amber-700 dark:hover:text-[#E8A838] ${read ? "text-stone-400 dark:text-[#4A5568]" : "text-stone-900 dark:text-[#F0EDE6]"}`}
        >
          {article.title}
        </Link>

        {article.description && (
          <p
            className={`${isEditorial ? "line-clamp-3 text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC]" : "line-clamp-1 text-sm leading-snug text-stone-500 dark:text-[#8A95A7]"}`}
          >
            {article.description}
          </p>
        )}

        <div className={`${isEditorial ? "mt-1 opacity-70 group-hover:opacity-100" : "mt-1 opacity-0 group-hover:opacity-100"} flex items-center gap-0.5 transition-opacity`}>
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
            className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-[#6B7585] dark:hover:bg-[#1E2533] dark:hover:text-[#F0EDE6]"
            title="Open article"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {showImage && (
        <div className={`${isEditorial ? "relative mt-1 hidden h-[92px] w-[92px] rounded-2xl sm:block" : "relative mt-0.5 h-[72px] w-[72px] rounded-[6px]"} shrink-0 overflow-hidden bg-stone-100 dark:bg-[#1E2533]`}>
          <Image
            src={article.imageUrl!}
            alt=""
            fill
            sizes={isEditorial ? "92px" : "72px"}
            onError={() => setImgError(true)}
            className="object-cover"
          />
        </div>
      )}
    </div>
  )
}
