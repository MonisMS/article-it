import Link from "next/link"
import { db } from "@/lib/db"
import { topics, articleTopics } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { getArticlesByTopicSlug } from "@/lib/db/queries/articles"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { ArrowLeft } from "lucide-react"

type Props = { searchParams: Promise<{ topic?: string; page?: string }> }

export default async function DiscoverPage({ searchParams }: Props) {
  const { topic: topicSlug, page: pageParam } = await searchParams
  const page = Math.max(0, Number(pageParam ?? 0))

  // Topic detail view
  if (topicSlug) {
    const { topic, articles } = await getArticlesByTopicSlug(topicSlug, page)
    if (!topic) return <div className="p-8 text-zinc-500">Topic not found.</div>

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/discover" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> All topics
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">{topic.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{topic.name}</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{topic.description}</p>
          </div>
        </div>

        {articles.length === 0 ? (
          <p className="text-zinc-500 text-sm">No articles yet for this topic.</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a as ArticleCardData} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100">
              <Link
                href={`/discover?topic=${topicSlug}&page=${Math.max(0, page - 1)}`}
                className={`rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors ${page === 0 ? "pointer-events-none opacity-30" : ""}`}
              >← Previous</Link>
              <span className="text-sm text-zinc-400">Page {page + 1}</span>
              <Link
                href={`/discover?topic=${topicSlug}&page=${page + 1}`}
                className={`rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors ${articles.length < 20 ? "pointer-events-none opacity-30" : ""}`}
              >Next →</Link>
            </div>
          </>
        )}
      </div>
    )
  }

  // Topic grid view
  const allTopics = await db.query.topics.findMany({
    where: eq(topics.isActive, true),
    orderBy: (t, { asc }) => asc(t.name),
  })

  // Get article counts per topic
  const counts = await db
    .select({ topicId: articleTopics.topicId, count: count() })
    .from(articleTopics)
    .groupBy(articleTopics.topicId)
  const countMap = Object.fromEntries(counts.map((c) => [c.topicId, c.count]))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Discover</h1>
        <p className="text-sm text-zinc-500 mt-1">Browse all topics and find articles you love.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allTopics.map((topic) => (
          <Link
            key={topic.id}
            href={`/discover?topic=${topic.slug}`}
            className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:shadow-md transition-all"
          >
            <span className="text-3xl">{topic.icon}</span>
            <div>
              <p className="font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">{topic.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{countMap[topic.id] ?? 0} articles</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
