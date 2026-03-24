import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getArticlesForUser, getUserTopicsWithMeta, getBookmarkedArticleIds } from "@/lib/db/queries/articles"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { TopicFilter } from "@/components/topic-filter"
import { Rss } from "lucide-react"
import { TriggerIngestButton } from "@/components/trigger-ingest-button"

type Props = {
  searchParams: Promise<{ topic?: string; page?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  const { topic, page: pageParam } = await searchParams
  const page = Math.max(0, Number(pageParam ?? 0))

  const [userTopics, articleRows, bookmarkedIds] = await Promise.all([
    getUserTopicsWithMeta(session.user.id),
    getArticlesForUser(session.user.id, topic, page),
    getBookmarkedArticleIds(session.user.id),
  ])

  const topics = userTopics.map((ut) => ut.topic)
  const articles = articleRows.map((a) => ({
    ...a,
    isBookmarked: bookmarkedIds.has(a.id),
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Your Feed</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {topics.length === 0
            ? "Follow some topics to start building your feed."
            : `Articles from ${topics.length} topic${topics.length === 1 ? "" : "s"} you follow.`}
        </p>
      </div>

      {topics.length > 0 && (
        <div className="mb-6">
          <Suspense>
            <TopicFilter topics={topics} />
          </Suspense>
        </div>
      )}

      {articles.length === 0 ? (
        <EmptyState hasTopics={topics.length > 0} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article as ArticleCardData} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100">
            <a
              href={`/dashboard?${topic ? `topic=${topic}&` : ""}page=${Math.max(0, page - 1)}`}
              className={`rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors ${page === 0 ? "pointer-events-none opacity-30" : ""}`}
            >
              ← Previous
            </a>
            <span className="text-sm text-zinc-400">Page {page + 1}</span>
            <a
              href={`/dashboard?${topic ? `topic=${topic}&` : ""}page=${page + 1}`}
              className={`rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors ${articles.length < 20 ? "pointer-events-none opacity-30" : ""}`}
            >
              Next →
            </a>
          </div>
        </>
      )}
    </div>
  )
}

function EmptyState({ hasTopics }: { hasTopics: boolean }) {
  if (!hasTopics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 mb-4">
          <Rss className="w-5 h-5 text-zinc-400" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">No topics yet</h2>
        <p className="mt-2 text-sm text-zinc-500 max-w-xs">
          Head to <a href="/onboarding" className="font-medium text-zinc-900 underline underline-offset-2">onboarding</a> to pick topics and build your feed.
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 mb-4">
        <Rss className="w-5 h-5 text-zinc-400" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900">No articles yet</h2>
      <p className="mt-2 text-sm text-zinc-500 max-w-xs">
        The ingestion pipeline hasn&apos;t run yet. Trigger it manually to fetch articles now.
      </p>
      <TriggerIngestButton />
    </div>
  )
}
