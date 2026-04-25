import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Search } from "lucide-react"
import { TopicIcon } from "@/components/topic-icon"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { SearchBarHero } from "@/components/search-bar"
import { auth } from "@/lib/auth"
import { searchFeedForUser } from "@/lib/db/queries/articles"

export const metadata: Metadata = {
  title: "Search - Curio",
  description: "Search across articles and followed topics in your feed.",
}

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
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  const { q, page: pageParam } = await searchParams
  const query = q?.trim() ?? ""
  const page = Math.max(0, Number(pageParam ?? 0))

  const searchResult = query.length >= 2 ? await searchFeedForUser(session.user.id, query, page) : { articles: [], topics: [] }
  const { articles, topics } = searchResult

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6">
      <header className="border-b border-stone-200/80 pb-8 dark:border-[#1E2A3A]">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-[#6B7585]">
            Search
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6] sm:text-[2.4rem]">
            Search your reading universe
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC] sm:text-base">
            Find articles across the topics and sources already shaping your feed.
          </p>
        </div>

        <div className="mt-6 max-w-2xl">
          <SearchBarHero initialValue={query} />
        </div>

        {!query && (
          <div className="mt-5 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-[#6B7585]">
              Try one of these
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Link
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="rounded-full border border-stone-200/80 bg-white px-3 py-1.5 text-[13px] font-medium text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#B8C0CC] dark:hover:border-[#2D3B4F] dark:hover:text-[#F0EDE6]"
                >
                  {suggestion}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="py-8">
        {query && query.length < 2 && (
          <p className="py-12 text-center text-sm text-stone-400 dark:text-[#6B7585]">
            Enter at least 2 characters.
          </p>
        )}

        {query.length >= 2 && (
          <>
            {topics.length > 0 && (
              <div className="mb-6 rounded-2xl border border-stone-200/80 bg-white/80 p-4 dark:border-[#1E2A3A] dark:bg-[#161C26]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-[#6B7585]">
                  Matching topics in your feed
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/dashboard?topic=${topic.slug}`}
                      className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-white px-3 py-1.5 text-[13px] font-medium text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900 dark:border-[#2D3B4F] dark:bg-[#0D1117] dark:text-[#B8C0CC] dark:hover:border-[#E8A838] dark:hover:text-[#F0EDE6]"
                    >
                      <TopicIcon slug={topic.slug} size={12} className="shrink-0 opacity-70" />
                      <span>{topic.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {articles.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 dark:bg-[#1E2533]">
                  <Search className="h-7 w-7 text-stone-400 dark:text-[#6B7585]" />
                </div>
                <h2 className="text-lg font-semibold text-stone-800 dark:text-[#E8E3DA]">No results</h2>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-stone-400 dark:text-[#6B7585]">
                  Nothing matched &ldquo;{query}&rdquo;. Try a broader phrase or browse your topics instead.
                </p>
                <Link
                  href="/discover"
                  className="mt-5 inline-flex text-sm font-medium text-stone-700 underline underline-offset-4 transition-colors hover:text-stone-900 dark:text-[#B8C0CC] dark:hover:text-[#F0EDE6]"
                >
                  Browse topics &rarr;
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between gap-4 border-b border-stone-200/80 pb-4 dark:border-[#1E2A3A]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
                      Results
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6]">
                      Matches for &ldquo;{query}&rdquo;
                    </h2>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">
                    {articles.length === 20 ? "20+ results" : `${articles.length} result${articles.length === 1 ? "" : "s"}`}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article as ArticleCardData} />
                  ))}
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-stone-200/80 pt-6 dark:border-[#1E2A3A]">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${Math.max(0, page - 1)}`}
                    className={`rounded-xl border border-stone-200/80 bg-white px-5 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#B8C0CC] dark:hover:border-[#2D3B4F] dark:hover:bg-[#1E2533] ${page === 0 ? "pointer-events-none opacity-30" : ""}`}
                  >
                    &larr; Previous
                  </Link>
                  <span className="text-sm text-stone-400 dark:text-[#6B7585]">Page {page + 1}</span>
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className={`rounded-xl border border-stone-200/80 bg-white px-5 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#B8C0CC] dark:hover:border-[#2D3B4F] dark:hover:bg-[#1E2533] ${articles.length < 20 ? "pointer-events-none opacity-30" : ""}`}
                  >
                    Next &rarr;
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
