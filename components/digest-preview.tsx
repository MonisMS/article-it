import Link from "next/link"
import { Mail } from "lucide-react"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"

type Props = {
  articles: ArticleCardData[]
}

/**
 * Shown on the dashboard when the user has never received a digest yet.
 * Bridges the gap between signup and the first scheduled digest email —
 * gives immediate proof that curation is working.
 * Disappears automatically once the first digest is sent (digestLogs row exists).
 */
export function DigestPreview({ articles }: Props) {
  const preview = articles.slice(0, 5)
  if (preview.length === 0) return null

  return (
    <div className="mx-4 sm:mx-6 mb-10 rounded-xl border border-app-border bg-app-surface">
      <div className="px-5 py-4 border-b border-app-border flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-app-accent-light">
          <Mail className="h-3.5 w-3.5 text-app-accent" />
        </span>
        <div>
          <p className="text-sm font-semibold text-app-text">Your first digest preview</p>
          <p className="text-xs text-app-text-muted mt-0.5">
            This is what your digest will look like. It will arrive at your scheduled time.{" "}
            <Link href="/settings" className="text-app-accent hover:underline">
              Manage schedule
            </Link>
          </p>
        </div>
      </div>

      <div className="p-4 grid sm:grid-cols-2 gap-4">
        {preview.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
