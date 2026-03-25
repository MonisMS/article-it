import { searchArticles } from "@/lib/db/queries/articles"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { SearchBar } from "@/components/search-bar"
import { Search } from "lucide-react"
import Link from "next/link"

type Props = { searchParams: Promise<{ q?: string; page?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams
  const query = q?.trim() ?? ""
  const page = Math.max(0, Number(pageParam ?? 0))

  const articles = query.length >= 2 ? await searchArticles(query, page) : []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Search</h1>
        <p className="text-sm text-zinc-500 mt-1">Search across all articles by title or description.</p>
      </div>

      {/* Search input — pre-filled with current query */}
      <div className="mb-8 max-w-lg">
        <SearchBar initialValue={query} />
      </div>

      {/* No query yet */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 mb-4">
            <Search className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-sm text-zinc-500">Type something to search.</p>
        </div>
      )}

      {/* Query too short */}
      {query && query.length < 2 && (
        <p className="text-sm text-zinc-400">Enter at least 2 characters.</p>
      )}

      {/* Results */}
      {query.length >= 2 && (
        <>
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 mb-4">
                <Search className="w-5 h-5 text-zinc-400" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900">No results</h2>
              <p className="mt-2 text-sm text-zinc-500 max-w-xs">
                No articles matched &ldquo;{query}&rdquo;. Try different keywords.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-zinc-400 mb-4">
                Results for <span className="font-medium text-zinc-700">&ldquo;{query}&rdquo;</span>
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article as ArticleCardData} />
                ))}
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${Math.max(0, page - 1)}`}
                  className={`rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors ${page === 0 ? "pointer-events-none opacity-30" : ""}`}
                >
                  ← Previous
                </Link>
                <span className="text-sm text-zinc-400">Page {page + 1}</span>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                  className={`rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors ${articles.length < 20 ? "pointer-events-none opacity-30" : ""}`}
                >
                  Next →
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
