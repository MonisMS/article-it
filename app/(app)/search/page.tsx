import { searchArticles } from "@/lib/db/queries/articles"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { SearchBarHero } from "@/components/search-bar"
import { Search, Sparkles } from "lucide-react"
import Link from "next/link"

type Props = { searchParams: Promise<{ q?: string; page?: string }> }

const SUGGESTIONS = [
  "artificial intelligence",
  "climate change",
  "startup funding",
  "TypeScript",
  "machine learning",
  "space exploration",
]

export default async function SearchPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams
  const query = q?.trim() ?? ""
  const page = Math.max(0, Number(pageParam ?? 0))

  const articles = query.length >= 2 ? await searchArticles(query, page) : []

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header + search input */}
      <div className={`px-4 sm:px-6 border-b border-stone-200 dark:border-[#1E2A3A] bg-gradient-to-b from-stone-50 dark:from-[#161C26]/50 to-white dark:to-[#0D1117] transition-all ${
        query ? "pt-8 pb-6" : "pt-16 pb-12"
      }`}>
        {!query && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-[#2A3547] dark:to-[#2A3547] mb-5">
              <Search className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-[#F0EDE6] tracking-tight">Search</h1>
            <p className="text-stone-400 dark:text-[#6B7585] text-sm mt-2">Find articles across all the topics you follow.</p>
          </div>
        )}

        <div className={query ? "max-w-full" : "max-w-xl mx-auto"}>
          <SearchBarHero initialValue={query} />
        </div>

        {/* Suggestions — only when idle */}
        {!query && (
          <div className="max-w-xl mx-auto mt-5">
            <p className="text-xs text-stone-400 dark:text-[#6B7585] mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Try searching for
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="text-xs font-medium text-stone-600 dark:text-[#B8C0CC] bg-white dark:bg-[#161C26] border border-stone-200 dark:border-[#1E2A3A] hover:border-amber-300 hover:text-amber-700 px-3 py-1.5 rounded-full transition-all"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results area */}
      <div className="px-4 sm:px-6 py-8">

        {/* Query too short */}
        {query && query.length < 2 && (
          <p className="text-sm text-stone-400 dark:text-[#6B7585] text-center py-12">Enter at least 2 characters.</p>
        )}

        {/* Results */}
        {query.length >= 2 && (
          <>
            {articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-[#1E2533] flex items-center justify-center mb-5">
                  <Search className="w-7 h-7 text-stone-400 dark:text-[#6B7585]" />
                </div>
                <h2 className="text-lg font-semibold text-stone-800 dark:text-[#E8E3DA]">No results</h2>
                <p className="mt-2 text-sm text-stone-400 dark:text-[#6B7585] max-w-xs">
                  Nothing matched &ldquo;{query}&rdquo;. Try different keywords or browse topics instead.
                </p>
                <Link
                  href="/discover"
                  className="mt-5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Browse all topics →
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-stone-400 dark:text-[#6B7585] mb-5">
                  {articles.length === 20 ? "20+" : articles.length} result{articles.length === 1 ? "" : "s"} for{" "}
                  <span className="font-semibold text-stone-700 dark:text-[#C8C4BC]">&ldquo;{query}&rdquo;</span>
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article as ArticleCardData} />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-10 pt-6 border-t border-stone-100 dark:border-[#1E2A3A]/60">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${Math.max(0, page - 1)}`}
                    className={`rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-5 py-2 text-sm font-medium text-stone-500 dark:text-[#B8C0CC] hover:border-stone-300 dark:hover:border-[#2D3B4F] hover:bg-stone-50 dark:hover:bg-[#1E2533] transition-all shadow-sm ${page === 0 ? "pointer-events-none opacity-30" : ""}`}
                  >
                    ← Previous
                  </Link>
                  <span className="text-sm text-stone-400 dark:text-[#6B7585]">Page {page + 1}</span>
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className={`rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-5 py-2 text-sm font-medium text-stone-500 dark:text-[#B8C0CC] hover:border-stone-300 dark:hover:border-[#2D3B4F] hover:bg-stone-50 dark:hover:bg-[#1E2533] transition-all shadow-sm ${articles.length < 20 ? "pointer-events-none opacity-30" : ""}`}
                  >
                    Next →
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
