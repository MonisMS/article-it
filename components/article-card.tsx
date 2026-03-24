import Image from "next/image"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { BookmarkButton } from "@/components/bookmark-button"

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

export function ArticleCard({ article }: { article: ArticleCardData }) {
  const primaryTopic = article.articleTopics[0]

  return (
    <div className="group flex flex-col rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md transition-all overflow-hidden">
      {/* Cover image */}
      {article.imageUrl && (
        <div className="relative w-full h-40 bg-zinc-100 flex-shrink-0">
          <Image
            src={article.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
            unoptimized
          />
        </div>
      )}

      <div className="flex flex-col gap-3 p-4 flex-1">
        {primaryTopic && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{primaryTopic.icon}</span>
            <span className="text-xs font-medium text-zinc-500">{primaryTopic.name}</span>
          </div>
        )}

        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-zinc-900 leading-snug hover:text-zinc-600 transition-colors line-clamp-2"
        >
          {article.title}
        </Link>

        {article.description && (
          <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
            {article.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-500">{article.source.name}</span>
            {article.publishedAt && (
              <>
                <span>·</span>
                <span>{timeAgo(article.publishedAt)}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <BookmarkButton
              articleId={article.id}
              initialBookmarked={article.isBookmarked ?? false}
            />
            <Link
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
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
