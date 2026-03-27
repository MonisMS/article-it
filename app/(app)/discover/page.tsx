import Link from "next/link"
import { db } from "@/lib/db"
import { topics, articleTopics } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { getArticlesByTopicSlug } from "@/lib/db/queries/articles"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { ArrowLeft, ChevronRight } from "lucide-react"

const TOPIC_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-600",
  "from-green-500 to-emerald-600",
  "from-fuchsia-500 to-violet-600",
  "from-sky-500 to-blue-600",
  "from-red-500 to-rose-600",
]

function topicColorIndex(name: string): number {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % TOPIC_GRADIENTS.length
}

type Props = { searchParams: Promise<{ topic?: string; page?: string }> }

export default async function DiscoverPage({ searchParams }: Props) {
  const { topic: topicSlug, page: pageParam } = await searchParams
  const page = Math.max(0, Number(pageParam ?? 0))

  if (topicSlug) {
    const { topic, articles } = await getArticlesByTopicSlug(topicSlug, page)
    if (!topic) return <div className="p-8 text-stone-400">Topic not found.</div>

    const gradient = TOPIC_GRADIENTS[topicColorIndex(topic.name)]

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All topics
        </Link>

        {/* Hero banner */}
        <div className={`relative w-full rounded-2xl mb-8 overflow-hidden bg-gradient-to-br ${gradient}`}>
          <div className="px-8 py-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl mb-4">
              {topic.icon}
            </div>
            <h1 className="text-3xl font-bold text-white">{topic.name}</h1>
            {topic.description && (
              <p className="text-white/80 text-sm mt-2 max-w-md leading-relaxed">{topic.description}</p>
            )}
            <p className="text-white/60 text-xs mt-3">
              {articles.length === 20 ? "20+" : articles.length} articles
            </p>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="py-20 text-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl mx-auto mb-4`}>
              {topic.icon}
            </div>
            <h3 className="text-base font-semibold text-stone-800 mb-1">No articles yet</h3>
            <p className="text-sm text-stone-500">Check back soon — articles for this topic will appear here.</p>
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
                className={`rounded-xl border border-stone-200 bg-white px-5 py-2 text-sm font-medium text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm ${page === 0 ? "opacity-40 pointer-events-none" : ""}`}
              >
                ← Previous
              </Link>
              <span className="text-sm text-stone-400">Page {page + 1}</span>
              <Link
                href={`/discover?topic=${topicSlug}&page=${page + 1}`}
                className={`rounded-xl border border-stone-200 bg-white px-5 py-2 text-sm font-medium text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm ${articles.length < 20 ? "opacity-40 pointer-events-none" : ""}`}
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
    <div className="max-w-5xl mx-auto pt-10 pb-10 px-4 sm:px-6">
      <div className="pb-6 border-b border-stone-200 mb-8">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Discover</h1>
        <p className="text-stone-500 text-sm mt-1">Explore curated topics from the world&apos;s best sources.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {allTopics.map((topic, index) => {
          const gradient = TOPIC_GRADIENTS[index % TOPIC_GRADIENTS.length]
          return (
            <Link
              key={topic.id}
              href={`/discover?topic=${topic.slug}`}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-200`} />
              <div className="relative p-5 h-36 flex flex-col justify-between transform group-hover:-translate-y-0.5 group-hover:shadow-xl transition-all duration-200">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                  {topic.icon}
                </div>
                <div>
                  <p className="text-base font-bold text-white leading-tight">{topic.name}</p>
                  <p className="text-xs text-white/70 mt-0.5">{countMap[topic.id] ?? 0} articles</p>
                </div>
                <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-white/0 group-hover:text-white/80 transition-all duration-200" />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-10 flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-6 py-5">
        <div>
          <p className="text-sm font-semibold text-stone-900">Don&apos;t see your topic?</p>
          <p className="text-xs text-stone-500 mt-0.5">Help us grow the library.</p>
        </div>
        <Link
          href="/suggest"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 bg-white border border-amber-300 px-4 py-2 rounded-xl hover:shadow-sm transition-all flex-shrink-0"
        >
          Suggest one <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
