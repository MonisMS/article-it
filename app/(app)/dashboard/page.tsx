import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getArticlesForUser, getArticlesCountForUser, getUserTopicsWithMeta, getBookmarkedArticleIds, getReadArticleIds, hasReceivedDigest, getDailyQueue } from "@/lib/db/queries/articles"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { TopicFilter } from "@/components/topic-filter"
import { DigestPreview } from "@/components/digest-preview"
import { DailyQueue } from "@/components/daily-queue"
import { Rss } from "lucide-react"
import { TriggerIngestButton } from "@/components/trigger-ingest-button"
import Link from "next/link"

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

  const [userTopics, articleRows, totalCount, bookmarkedIds, readIds, digestReceived, queueRows] = await Promise.all([
    getUserTopicsWithMeta(session.user.id),
    getArticlesForUser(session.user.id, topic, page),
    getArticlesCountForUser(session.user.id, topic),
    getBookmarkedArticleIds(session.user.id),
    getReadArticleIds(session.user.id),
    hasReceivedDigest(session.user.id),
    // Only fetch the queue on page 0 with no topic filter — it's always cross-topic
    !topic && page === 0 ? getDailyQueue(session.user.id) : Promise.resolve([]),
  ])

  const topics = userTopics.map((ut) => ut.topic)
  const articles = articleRows.map((a) => ({
    ...a,
    isBookmarked: bookmarkedIds.has(a.id),
    isRead: readIds.has(a.id),
  }))
  const queueArticles = queueRows.map((a) => ({
    ...a,
    isBookmarked: bookmarkedIds.has(a.id),
    isRead: false, // queue only contains unread articles
  }))

  const totalPages = Math.max(1, Math.ceil(totalCount / 20))

  return (
    <div className="bg-app-bg min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="pt-10 pb-6 px-4 sm:px-6 border-b border-stone-200 mb-6 bg-gradient-to-b from-stone-50 to-transparent">
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Your Feed</h1>
          <p className="text-stone-500 text-sm mt-1">
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

        {topics.length > 0 && totalCount > 0 && !topic && page === 0 && (
          <DailyQueue initialArticles={queueArticles} />
        )}

        {!digestReceived && articles.length > 0 && !topic && page === 0 && (
          <DigestPreview articles={articles} />
        )}

        {articles.length === 0 ? (
          <EmptyState hasTopics={topics.length > 0} />
        ) : (
          <>
            {(!topic && page === 0) && (
              <div className="flex items-center gap-3 px-4 sm:px-6 mb-5">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">All articles</span>
                <div className="flex-1 h-px bg-gradient-to-r from-stone-200 to-transparent" />
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-5 px-4 sm:px-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article as ArticleCardData} />
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-4 px-4 sm:px-6 pb-10">
              <a
                href={`/dashboard?${topic ? `topic=${topic}&` : ""}page=${Math.max(0, page - 1)}`}
                className={`rounded-xl border border-stone-200 bg-white px-5 py-2 text-sm font-medium text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm ${page === 0 ? "opacity-40 pointer-events-none" : ""}`}
              >
                ← Previous
              </a>
              <span className="text-sm text-stone-400">
                Page {page + 1} of {totalPages}
              </span>
              <a
                href={`/dashboard?${topic ? `topic=${topic}&` : ""}page=${page + 1}`}
                className={`rounded-xl border border-stone-200 bg-white px-5 py-2 text-sm font-medium text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm ${(page + 1) * 20 >= totalCount ? "opacity-40 pointer-events-none" : ""}`}
              >
                Next →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ hasTopics }: { hasTopics: boolean }) {
  if (!hasTopics) {
    return (
      <div className="py-24 text-center px-4 sm:px-6">
        <div className="w-16 h-16 rounded-xl bg-app-accent-light flex items-center justify-center mx-auto mb-6">
          <Rss className="text-app-accent w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-app-text mt-4">Start following topics</h2>
        <p className="text-app-text-muted text-sm mt-2 max-w-sm mx-auto">
          Head to Discover to pick topics that interest you and build your personal feed.
        </p>
        <Link
          href="/discover"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-app-accent px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Browse topics
        </Link>
      </div>
    )
  }
  return (
    <div className="py-24 text-center px-4 sm:px-6">
      <div className="w-16 h-16 rounded-xl bg-app-accent-light flex items-center justify-center mx-auto mb-6">
        <Rss className="text-app-accent w-8 h-8" />
      </div>
      <h2 className="text-xl font-semibold text-app-text mt-4">No articles yet</h2>
      <p className="text-app-text-muted text-sm mt-2 max-w-sm mx-auto">
        The ingestion pipeline hasn&apos;t run yet. Trigger it manually to fetch articles now.
      </p>
      <div className="mt-6">
        <TriggerIngestButton />
      </div>
    </div>
  )
}
