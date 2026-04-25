import type { Metadata } from "next"
import Link from "next/link"
import { count, eq } from "drizzle-orm"
import { ArrowLeft, ChevronRight, Lightbulb } from "lucide-react"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { TopicIcon } from "@/components/topic-icon"
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

  // ── Topic detail view ────────────────────────────────────────────────────
  if (topicSlug) {
    const { topic, articles } = await getArticlesByTopicSlug(topicSlug, page)
    if (!topic) return <div className="p-8 text-app-text-muted">Topic not found.</div>

    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          href="/discover"
          className="group mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-app-text-muted transition-colors hover:text-app-text"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          All topics
        </Link>

        {/* Topic header */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-app-border pb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-app-accent-light text-app-accent">
              <TopicIcon slug={topic.slug} size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">
                {topic.name}
              </h1>
              {topic.description && (
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-app-text-muted">
                  {topic.description}
                </p>
              )}
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-app-border bg-app-surface-hover px-3 py-1 text-xs font-semibold text-app-text-muted">
            {articles.length === 20 ? "20+ articles" : `${articles.length} article${articles.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-accent-light text-app-accent">
              <TopicIcon slug={topic.slug} size={24} />
            </div>
            <h3 className="text-sm font-semibold text-app-text">No articles yet</h3>
            <p className="mt-1 text-sm text-app-text-muted">
              Check back soon. Articles for this topic will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article as ArticleCardData} />
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <Link
                href={`/discover?topic=${topicSlug}&page=${Math.max(0, page - 1)}`}
                aria-disabled={page === 0}
                tabIndex={page === 0 ? -1 : undefined}
                className={`rounded-xl border border-app-border bg-app-surface px-5 py-2 text-sm font-medium text-app-text-muted transition-colors hover:border-app-border-strong hover:text-app-text ${page === 0 ? "pointer-events-none opacity-40" : ""}`}
              >
                ← Previous
              </Link>
              <span className="text-sm text-app-text-subtle">Page {page + 1}</span>
              <Link
                href={`/discover?topic=${topicSlug}&page=${page + 1}`}
                aria-disabled={articles.length < 20}
                tabIndex={articles.length < 20 ? -1 : undefined}
                className={`rounded-xl border border-app-border bg-app-surface px-5 py-2 text-sm font-medium text-app-text-muted transition-colors hover:border-app-border-strong hover:text-app-text ${articles.length < 20 ? "pointer-events-none opacity-40" : ""}`}
              >
                Next →
              </Link>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Topic grid view ──────────────────────────────────────────────────────
  const allTopics = await db.query.topics.findMany({
    where: eq(topics.isActive, true),
    orderBy: (topicTable, { asc }) => asc(topicTable.name),
  })

  const counts = await db
    .select({ topicId: articleTopics.topicId, count: count() })
    .from(articleTopics)
    .groupBy(articleTopics.topicId)

  const countMap = Object.fromEntries(counts.map((row) => [row.topicId, row.count]))

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">
          Discover topics
        </h1>
        <p className="mt-1.5 text-sm text-app-text-muted">
          {allTopics.length} curated topics · Quality-ranked sources, updated daily
        </p>
      </div>

      {/* Topic grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allTopics.map((topic) => (
          <Link
            key={topic.id}
            href={`/discover?topic=${topic.slug}`}
            className="group flex flex-col gap-3 rounded-2xl border border-app-border bg-app-surface p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-app-border-strong hover:shadow-[0_4px_16px_rgba(28,25,23,0.06)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent-light text-app-accent">
                <TopicIcon slug={topic.slug} size={18} />
              </div>
              <span className="text-[11px] font-semibold tabular-nums text-app-text-subtle">
                {(countMap[topic.id] ?? 0).toLocaleString()}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm font-semibold text-app-text group-hover:text-app-accent transition-colors duration-150">
                {topic.name}
              </p>
              {topic.description && (
                <p className="line-clamp-2 text-xs leading-relaxed text-app-text-muted">
                  {topic.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Suggest topic footer */}
      <div className="mt-10 flex items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-surface px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-surface-hover text-app-text-muted">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-app-text">Don&apos;t see your topic?</p>
            <p className="text-xs text-app-text-muted">Suggest one and help shape the library.</p>
          </div>
        </div>
        <Link
          href="/suggest"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-app-border px-4 py-2 text-sm font-medium text-app-text-muted transition-colors hover:border-app-border-strong hover:text-app-text"
        >
          Suggest <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
