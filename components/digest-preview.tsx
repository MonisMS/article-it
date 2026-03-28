import Link from "next/link"
import { Mail } from "lucide-react"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"

type Props = {
  articles: ArticleCardData[]
}

export function DigestPreview({ articles }: Props) {
  const preview = articles.slice(0, 4)
  if (preview.length === 0) return null

  return (
    <div className="mx-4 sm:mx-6 mb-10 rounded-2xl border border-dashed border-amber-300 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/60 dark:from-[#2A3547]/40 to-white dark:to-[#161C26] overflow-hidden">
      <div className="px-5 py-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-[#2A3547]">
          <Mail className="h-4 w-4 text-amber-600 dark:text-[#E8A838]" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6]">Your first digest preview</p>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-[#2A3547] text-amber-700 dark:text-[#E8A838] flex-shrink-0">Preview</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-[#B8C0CC]">
            This is what your email digest will look like.{" "}
            <Link href="/settings" className="text-amber-600 dark:text-[#E8A838] hover:underline font-medium">
              Manage schedule →
            </Link>
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 grid sm:grid-cols-2 gap-3">
        {preview.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
