import Link from "next/link"
import { db } from "@/lib/db"
import { topics, articleTopics } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { getArticlesByTopicSlug } from "@/lib/db/queries/articles"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { ArrowLeft, ChevronRight, Newspaper } from "lucide-react"

type Props = { searchParams: Promise<{ topic?: string; page?: string }> }

export default async function DiscoverPage({ searchParams }: Props) {
  const { topic: topicSlug, page: pageParam } = await searchParams
  const page = Math.max(0, Number(pageParam ?? 0))

  if (topicSlug) {
    const { topic, articles } = await getArticlesByTopicSlug(topicSlug, page)
    if (!topic) return <div className="p-8 text-app-text-muted">Topic not found.</div>

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-sm text-app-text-muted hover:text-app-text transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All topics
        </Link>

        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-app-accent-light flex items-center justify-center text-3xl mb-4">
            {topic.icon}
          </div>
          <h1 className="text-2xl font-bold text-app-text">{topic.name}</h1>
          <p className="text-app-text-muted text-sm mt-1 max-w-xl">{topic.description}</p>
          <p className="text-xs text-app-text-subtle mt-3">{articles.length === 20 ? "20+" : articles.length} articles</p>
        </div>

        {articles.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-app-accent-light flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-5 h-5 text-app-accent" />
            </div>
            <h3 className="text-base font-semibold text-app-text mb-1">No articles yet</h3>
            <p className="text-sm text-app-text-muted">Check back soon — articles for this topic will appear here.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-5">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a as ArticleCardData} />
              ))}
            </div>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href={`/discover?topic=${topicSlug}&page=${Math.max(0, page - 1)}`}
                className={`rounded-full border border-app-border px-5 py-2 text-sm font-medium text-app-text-muted hover:bg-app-hover hover:text-app-text transition-colors ${page === 0 ? "opacity-40 pointer-events-none" : ""}`}
              >
                ← Previous
              </Link>
              <span className="text-sm text-app-text-subtle">Page {page + 1}</span>
              <Link
                href={`/discover?topic=${topicSlug}&page=${page + 1}`}
                className={`rounded-full border border-app-border px-5 py-2 text-sm font-medium text-app-text-muted hover:bg-app-hover hover:text-app-text transition-colors ${articles.length < 20 ? "opacity-40 pointer-events-none" : ""}`}
              >
                Next →
              </Link>
            </div>
          </>
        )}
      </div>
    )
  }

  const allTopics = await db.query.topics.findMany({
    where: eq(topics.isActive, true),
    orderBy: (t, { asc }) => asc(t.name),
  })

  const counts = await db
    .select({ topicId: articleTopics.topicId, count: count() })
    .from(articleTopics)
    .groupBy(articleTopics.topicId)
  const countMap = Object.fromEntries(counts.map((c) => [c.topicId, c.count]))

  return (
    <div className="max-w-5xl mx-auto pt-10 pb-6 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-app-text tracking-tight">Discover</h1>
        <p className="text-app-text-muted text-sm mt-1">Browse all topics and find articles you love.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {allTopics.map((topic) => (
          <Link
            key={topic.id}
            href={`/discover?topic=${topic.slug}`}
            className="group relative rounded-2xl bg-app-surface border border-app-border p-5 hover:border-app-accent hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 w-4 h-4 text-app-accent" />
            <div className="w-12 h-12 rounded-xl bg-app-accent-light flex items-center justify-center text-2xl mb-4">
              {topic.icon}
            </div>
            <p className="text-base font-semibold text-app-text mt-1">{topic.name}</p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs text-app-text-subtle">
              <span className="w-1 h-1 rounded-full bg-app-text-subtle inline-block" />
              {countMap[topic.id] ?? 0} articles
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between rounded-2xl bg-app-accent-light border border-app-border px-6 py-4">
        <p className="text-sm font-medium text-app-text">Don&apos;t see a topic you care about?</p>
        <Link href="/suggest" className="text-sm font-semibold text-app-accent hover:underline underline-offset-2 flex-shrink-0">
          Suggest one →
        </Link>
      </div>
    </div>
  )
}
