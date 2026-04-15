import type { Metadata } from "next"
import Link from "next/link"
import { count, eq } from "drizzle-orm"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { db } from "@/lib/db"
import { getArticlesByTopicSlug } from "@/lib/db/queries/articles"
import { articleTopics, topics } from "@/lib/db/schema"

export const metadata: Metadata = {
  title: "Discover - Curio",
  description: "Browse all topics and find articles that interest you.",
}

type Props = { searchParams: Promise<{ topic?: string; page?: string }> }

type TopicRow = {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
}

export default async function DiscoverPage({ searchParams }: Props) {
  const { topic: topicSlug, page: pageParam } = await searchParams
  const page = Math.max(0, Number(pageParam ?? 0))

  if (topicSlug) {
    const { topic, articles } = await getArticlesByTopicSlug(topicSlug, page)
    if (!topic) return <div className="p-8 text-stone-400">Topic not found.</div>

    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          href="/discover"
          className="group mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-[#B8C0CC] dark:hover:text-[#F0EDE6]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          All topics
        </Link>

        <section className="rounded-[2rem] border border-stone-200/80 bg-white/80 px-6 py-7 shadow-[0_18px_50px_rgba(28,25,23,0.04)] dark:border-[#1E2A3A] dark:bg-[#121925]/80 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
                Curated topic
              </p>
              <div className="mt-3 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl dark:bg-[#1E2533]">
                  {topic.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6]">
                    {topic.name}
                  </h1>
                  {topic.description && (
                    <p className="mt-3 max-w-xl text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC]">
                      {topic.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#8A95A7]">
              {articles.length === 20 ? "20+ articles" : `${articles.length} article${articles.length === 1 ? "" : "s"}`}
            </div>
          </div>
        </section>

        {articles.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-3xl dark:bg-[#1E2533]">
              {topic.icon}
            </div>
            <h3 className="text-base font-semibold text-stone-800 dark:text-[#F0EDE6]">No articles yet</h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-[#8A95A7]">
              Check back soon. Articles for this topic will appear here.
            </p>
          </div>
        ) : (
          <>
            <section className="mt-10">
              <div className="flex items-end justify-between gap-4 border-b border-stone-200/80 pb-4 dark:border-[#1E2A3A]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
                    Topic feed
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6]">
                    Recent reads in {topic.name}
                  </h2>
                </div>
                <span className="text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">
                  Page {page + 1}
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article as ArticleCardData} />
                ))}
              </div>
            </section>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href={`/discover?topic=${topicSlug}&page=${Math.max(0, page - 1)}`}
                className={`rounded-xl border border-stone-200/80 bg-white px-5 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#B8C0CC] dark:hover:border-[#2D3B4F] dark:hover:bg-[#1E2533] ${page === 0 ? "pointer-events-none opacity-40" : ""}`}
              >
                &larr; Previous
              </Link>
              <span className="text-sm text-stone-400 dark:text-[#6B7585]">Page {page + 1}</span>
              <Link
                href={`/discover?topic=${topicSlug}&page=${page + 1}`}
                className={`rounded-xl border border-stone-200/80 bg-white px-5 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#B8C0CC] dark:hover:border-[#2D3B4F] dark:hover:bg-[#1E2533] ${articles.length < 20 ? "pointer-events-none opacity-40" : ""}`}
              >
                Next &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    )
  }

  const allTopics = await db.query.topics.findMany({
    where: eq(topics.isActive, true),
    orderBy: (topicTable, { asc }) => asc(topicTable.name),
  })

  const counts = await db
    .select({ topicId: articleTopics.topicId, count: count() })
    .from(articleTopics)
    .groupBy(articleTopics.topicId)

  const countMap = Object.fromEntries(counts.map((row) => [row.topicId, row.count]))
  const groupedTopics = groupTopics(allTopics)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
      <header className="border-b border-stone-200/80 pb-8 dark:border-[#1E2A3A]">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-[#6B7585]">
            Discover topics
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6] sm:text-[2.4rem]">
            Explore a calmer library
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC] sm:text-base">
            Browse curated topics from strong sources, organized for fast scanning instead of bright promotional tiles.
          </p>
        </div>
      </header>

      <section className="mt-8 rounded-[2rem] border border-stone-200/80 bg-white/75 px-6 py-6 shadow-[0_18px_50px_rgba(28,25,23,0.04)] dark:border-[#1E2A3A] dark:bg-[#121925]/75">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200/80 pb-4 dark:border-[#1E2A3A]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
              Topic index
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6]">
              Browse by name
            </h2>
          </div>
          <div className="rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#8A95A7]">
            {allTopics.length} topics
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {groupedTopics.map(([label, topicGroup]) => (
            <section key={label} className="rounded-[1.5rem] border border-stone-200/70 bg-stone-50/70 p-4 dark:border-[#1E2A3A] dark:bg-[#161C26]/65">
              <div className="flex items-center gap-3 border-b border-stone-200/70 pb-3 dark:border-[#1E2A3A]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-stone-700 dark:bg-[#0F1621] dark:text-[#F0EDE6]">
                  {label}
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-[#8A95A7]">
                    {label}
                  </h3>
                  <p className="text-xs text-stone-400 dark:text-[#6B7585]">
                    {topicGroup.length} topic{topicGroup.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="mt-2 divide-y divide-stone-200/70 dark:divide-[#1E2A3A]">
                {topicGroup.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/discover?topic=${topic.slug}`}
                    className="group flex items-start gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-white/90 dark:hover:bg-[#0F1621]"
                  >
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl dark:bg-[#0F1621]">
                      {topic.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-base font-medium text-stone-900 transition-colors group-hover:text-stone-700 dark:text-[#F0EDE6] dark:group-hover:text-white">
                            {topic.name}
                          </p>
                          {topic.description && (
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-500 dark:text-[#8A95A7]">
                              {topic.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-stone-300 transition-colors group-hover:text-stone-500 dark:text-[#2D3B4F] dark:group-hover:text-[#B8C0CC]" />
                      </div>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">
                        {countMap[topic.id] ?? 0} articles
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-8 flex items-center justify-between gap-4 rounded-[1.75rem] border border-stone-200/80 bg-white/70 px-6 py-5 dark:border-[#1E2A3A] dark:bg-[#121925]/75">
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6]">Don&apos;t see your topic?</p>
          <p className="mt-1 text-sm text-stone-500 dark:text-[#8A95A7]">Suggest one and help shape the library.</p>
        </div>
        <Link
          href="/suggest"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-white dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#B8C0CC] dark:hover:border-[#2D3B4F] dark:hover:bg-[#1E2533]"
        >
          Suggest one <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  )
}

function groupTopics(topicRows: TopicRow[]) {
  const groups = new Map<string, TopicRow[]>()

  for (const topic of topicRows) {
    const label = topic.name.charAt(0).toUpperCase()
    const bucket = /^[A-Z]$/.test(label) ? label : "#"
    const existing = groups.get(bucket) ?? []
    existing.push(topic)
    groups.set(bucket, existing)
  }

  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
}
