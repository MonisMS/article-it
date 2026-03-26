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
    <div className={`group flex flex-col rounded-xl border transition-all duration-150 overflow-hidden
      ${read
        ? "bg-app-hover border-app-border"
        : "bg-app-surface border-app-border hover:border-app-border-strong hover:shadow-sm"
      }`}>
      {showImage && (
        <img
          src={article.imageUrl!}
          alt=""
          onError={() => setImgError(true)}
          className="object-cover aspect-video w-full"
        />
      )}

      <div className="flex flex-col gap-3 flex-1 p-5">
        {primaryTopic && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{primaryTopic.icon}</span>
            <span className="bg-app-accent-light text-app-accent rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {primaryTopic.name}
            </span>
          </div>
        )}

        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-base font-semibold leading-snug hover:text-app-accent transition-colors line-clamp-2
            ${read ? "text-app-text-muted" : "text-app-text"}`}
        >
          {article.title}
        </Link>

        {article.description && (
          <p className="text-sm text-app-text-muted leading-relaxed line-clamp-2">
            {article.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2 text-xs text-app-text-subtle">
            <span className="font-medium">{article.source.name}</span>
            {article.publishedAt && (
              <>
                <span>·</span>
                <span>{timeAgo(article.publishedAt)}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
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
              className="flex items-center justify-center w-7 h-7 rounded-md text-app-text-subtle hover:text-app-text hover:bg-app-hover transition-colors"
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
