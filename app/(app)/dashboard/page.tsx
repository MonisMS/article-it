import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { Rss } from "lucide-react"
import { TopicIcon } from "@/components/topic-icon"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { isAdmin as isAdminEmail } from "@/lib/admin"
import { db } from "@/lib/db"
import { user as userTable } from "@/lib/db/schema/auth"
import {
  getArticlesCountForUser,
  getArticlesForUser,
  getBookmarkedArticleIds,
  getDailyQueue,
  getReadArticleIds,
  getUserTopicsWithMeta,
  hasReceivedDigest,
} from "@/lib/db/queries/articles"
import { getNewArticlesCount } from "@/lib/db/queries/new-articles"
import { getReadingStreak } from "@/lib/db/queries/streak"
import { readingTime, timeAgo } from "@/lib/utils"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { ColdStartNudge } from "@/components/cold-start-nudge"
import { DailyQueue } from "@/components/daily-queue"
import { DigestPreview } from "@/components/digest-preview"
import { NewArticlesBanner } from "@/components/new-articles-banner"
import { ReadingStreak } from "@/components/reading-streak"
import { TopicFilter } from "@/components/topic-filter"
import { TriggerIngestButton } from "@/components/trigger-ingest-button"
import { VisitTracker } from "@/components/visit-tracker"

export const metadata: Metadata = {
  title: "Feed - Curio",
  description: "Your personalized article feed, ranked by source quality.",
}

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

  const canTriggerIngest = (process.env.NODE_ENV === "development" && !process.env.ADMIN_EMAIL)
    ? true
    : isAdminEmail(session.user.email)

  const { topic, page: pageParam } = await searchParams
  const page = Math.max(0, Number(pageParam ?? 0))

  const userRecord = (!topic && page === 0)
    ? await db
        .select({ lastVisitAt: userTable.lastVisitAt })
        .from(userTable)
        .where(eq(userTable.id, session.user.id))
        .then((rows) => rows[0])
    : null

  const [userTopics, articleRows, totalCount, bookmarkedIds, readIds, digestReceived, queueRows, streakData, newCount] = await Promise.all([
    getUserTopicsWithMeta(session.user.id),
    getArticlesForUser(session.user.id, topic, page),
    getArticlesCountForUser(session.user.id, topic),
    getBookmarkedArticleIds(session.user.id),
    getReadArticleIds(session.user.id),
    hasReceivedDigest(session.user.id),
    !topic && page === 0 ? getDailyQueue(session.user.id) : Promise.resolve([]),
    !topic && page === 0 ? getReadingStreak(session.user.id) : Promise.resolve(null),
    userRecord?.lastVisitAt ? getNewArticlesCount(session.user.id, userRecord.lastVisitAt) : Promise.resolve(0),
  ])

  const topics = userTopics.map((ut) => ut.topic)
  const articles = articleRows.map((article) => ({
    ...article,
    isBookmarked: bookmarkedIds.has(article.id),
    isRead: readIds.has(article.id),
  }))
  const queueArticles = queueRows.map((article) => ({
    ...article,
    isBookmarked: bookmarkedIds.has(article.id),
    isRead: readIds.has(article.id),
  }))

  const totalPages = Math.max(1, Math.ceil(totalCount / 20))
  const showQueue = topics.length > 0 && totalCount > 0 && !topic && page === 0 && queueArticles.length > 0
  const showDigestBanner = !digestReceived && articles.length > 0 && !topic && page === 0
  const showStreak = streakData !== null && topics.length > 0 && totalCount > 0 && !topic && page === 0
  const showNewBanner = newCount > 0 && userRecord?.lastVisitAt && !topic && page === 0
  const showColdStart = topics.length > 0 && topics.length < 3 && !topic && page === 0
  const showFeatured = articles.length > 0 && !topic && page === 0

  const featuredArticle = showFeatured ? (articles[0] as ArticleCardData) : null
  const streamArticles = showFeatured ? articles.slice(1) : articles
  const activeTopicName = topic ? topics.find((item) => item.slug === topic)?.name ?? topic : null

  return (
    <div className="min-h-full bg-app-bg dark:bg-[#0D1117]">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <VisitTracker />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,44rem)_18rem] xl:justify-center">
          <main className="min-w-0">
            <header className="border-b border-stone-200/80 pb-8 dark:border-[#1E2A3A]">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-[#6B7585]">
                  Editorial feed
                </p>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                  <div className="max-w-2xl">
                    <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6] sm:text-[2.4rem]">
                      Your reading surface
                    </h1>
                    <p className="mt-3 text-[15px] leading-7 text-stone-500 dark:text-[#B8C0CC] sm:text-base">
                      {topics.length === 0
                        ? "Follow a few topics to start building a feed worth reading."
                        : `A quieter stream from ${topics.length} topic${topics.length === 1 ? "" : "s"} you follow, arranged to help you settle in and read.`}
                    </p>
                  </div>
                  <div className="rounded-full border border-stone-200/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:border-[#1E2A3A] dark:bg-[#121925] dark:text-[#8A95A7]">
                    {totalCount} article{totalCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              {topics.length > 0 && (
                <div className="mt-6">
                  <Suspense>
                    <TopicFilter topics={topics} />
                  </Suspense>
                </div>
              )}
            </header>

            <div className="mt-6 space-y-3">
              {showNewBanner && <NewArticlesBanner count={newCount} />}
              {showStreak && <ReadingStreak data={streakData!} />}
            </div>

            {articles.length === 0 ? (
              <div className="mt-10">
                <EmptyState hasTopics={topics.length > 0} canTriggerIngest={canTriggerIngest} />
              </div>
            ) : (
              <>
                {featuredArticle && (
                  <section className="mt-10">
                    <FeaturedRead article={featuredArticle} />
                  </section>
                )}

                {showQueue && (
                  <section className="mt-10">
                    <DailyQueue initialArticles={queueArticles} />
                  </section>
                )}

                <section className="mt-10">
                  <div className="flex items-end justify-between gap-4 border-b border-stone-200/80 pb-4 dark:border-[#1E2A3A]">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
                        Article stream
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6]">
                        Keep reading
                      </h2>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">
                      {totalCount} article{totalCount !== 1 ? "s" : ""}{activeTopicName ? ` in ${activeTopicName}` : ""}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    {streamArticles.map((article) => (
                      <ArticleCard key={article.id} article={article as ArticleCardData} variant="editorial" />
                    ))}
                  </div>
                </section>

                <nav className="mt-10 flex items-center justify-between gap-6 border-t border-stone-200/80 pt-6 dark:border-[#1E2A3A]">
                  <a
                    href={`/dashboard?${topic ? `topic=${topic}&` : ""}page=${Math.max(0, page - 1)}`}
                    aria-disabled={page === 0}
                    tabIndex={page === 0 ? -1 : undefined}
                    className={`text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-[#8A95A7] dark:hover:text-[#F0EDE6] ${page === 0 ? "pointer-events-none opacity-40" : ""}`}
                  >
                    &larr; Previous
                  </a>
                  <span className="text-sm text-stone-400 dark:text-[#6B7585]">
                    Page {page + 1} of {totalPages}
                  </span>
                  <a
                    href={`/dashboard?${topic ? `topic=${topic}&` : ""}page=${page + 1}`}
                    aria-disabled={(page + 1) * 20 >= totalCount}
                    tabIndex={(page + 1) * 20 >= totalCount ? -1 : undefined}
                    className={`text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-[#8A95A7] dark:hover:text-[#F0EDE6] ${(page + 1) * 20 >= totalCount ? "pointer-events-none opacity-40" : ""}`}
                  >
                    Next &rarr;
                  </a>
                </nav>
              </>
            )}
          </main>

          <aside className="lg:pt-2">
            <div className="space-y-5 lg:sticky lg:top-6">
              <RailCard title="Digest">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-stone-500 dark:text-[#8A95A7]">
                    Stay on top of the best pieces from your feed without checking all day.
                  </p>
                  {showDigestBanner ? (
                    <DigestPreview />
                  ) : (
                    <Link
                      href="/profile?tab=digests"
                      className="inline-flex text-sm font-medium text-stone-700 underline underline-offset-4 transition-colors hover:text-stone-900 dark:text-[#B8C0CC] dark:hover:text-[#F0EDE6]"
                    >
                      Open digests &rarr;
                    </Link>
                  )}
                </div>
              </RailCard>

              <RailCard title="Following">
                {topics.length === 0 ? (
                  <p className="text-sm leading-6 text-stone-500 dark:text-[#8A95A7]">
                    Your feed will fill up once you follow a few.
                    <Link
                      href="/discover"
                      className="ml-2 text-stone-700 underline underline-offset-4 transition-colors hover:text-stone-900 dark:text-[#B8C0CC] dark:hover:text-[#F0EDE6]"
                    >
                      Browse topics &rarr;
                    </Link>
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {topics.slice(0, 10).map((item) => (
                      <Link
                        key={item.slug}
                        href={`/dashboard?topic=${item.slug}`}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-stone-200/80 bg-stone-50/70 px-3 py-1.5 text-[13px] text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900 dark:border-[#1E2A3A] dark:bg-[#121925] dark:text-[#B8C0CC] dark:hover:border-[#2A3547] dark:hover:text-[#F0EDE6]"
                        title={`Filter by ${item.name}`}
                      >
                        <TopicIcon slug={item.slug} size={12} className="shrink-0 opacity-60" />
                        <span className="max-w-[10rem] truncate">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {topics.length > 10 && (
                  <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">
                    +{topics.length - 10} more
                  </p>
                )}
              </RailCard>

              <RailCard title="Revisit">
                <div className="space-y-3 text-sm">
                  <Link
                    href="/bookmarks"
                    className="block text-stone-600 transition-colors hover:text-stone-900 dark:text-[#B8C0CC] dark:hover:text-[#F0EDE6]"
                  >
                    Saved bookmarks &rarr;
                  </Link>
                  <Link
                    href="/history"
                    className="block text-stone-600 transition-colors hover:text-stone-900 dark:text-[#B8C0CC] dark:hover:text-[#F0EDE6]"
                  >
                    Reading history &rarr;
                  </Link>
                  <Link
                    href="/discover"
                    className="block text-stone-600 transition-colors hover:text-stone-900 dark:text-[#B8C0CC] dark:hover:text-[#F0EDE6]"
                  >
                    Find new topics &rarr;
                  </Link>
                </div>
              </RailCard>

              {showColdStart && (
                <RailCard title="Feed quality">
                  <ColdStartNudge topicCount={topics.length} />
                </RailCard>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function FeaturedRead({ article }: { article: ArticleCardData }) {
  const primaryTopic = article.articleTopics[0]

  return (
    <div className="rounded-[2rem] border border-stone-200/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(28,25,23,0.05)] dark:border-[#1E2A3A] dark:bg-[#121925]/85 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
        Featured read
      </p>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">
          {primaryTopic && (
            <>
              <span className="font-semibold text-stone-500 dark:text-[#8A95A7]">
                <TopicIcon slug={primaryTopic.slug} size={11} className="mr-1 shrink-0 opacity-70" />{primaryTopic.name}
              </span>
              <span className="text-stone-200 dark:text-[#2A3547]">&bull;</span>
            </>
          )}
          <span>{article.source.name}</span>
          {article.publishedAt && (
            <>
              <span className="text-stone-200 dark:text-[#2A3547]">&bull;</span>
              <span>{timeAgo(article.publishedAt)}</span>
            </>
          )}
          {article.description && (
            <>
              <span className="text-stone-200 dark:text-[#2A3547]">&bull;</span>
              <span>{readingTime(article.description)}</span>
            </>
          )}
        </div>

        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block max-w-3xl text-[1.8rem] font-semibold leading-[1.18] tracking-tight text-stone-900 transition-colors hover:text-amber-700 dark:text-[#F0EDE6] dark:hover:text-[#E8A838] sm:text-[2.2rem]"
        >
          {article.title}
        </Link>

        {article.description && (
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC] sm:text-base">
            {article.description}
          </p>
        )}

        <div className="mt-6">
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-[#F0EDE6] dark:text-[#0D1117]"
          >
            Read now
          </Link>
        </div>
      </div>
    </div>
  )
}

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-stone-200/80 bg-white/70 p-5 dark:border-[#1E2A3A] dark:bg-[#121925]/75">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function EmptyState({ hasTopics, canTriggerIngest }: { hasTopics: boolean; canTriggerIngest: boolean }) {
  if (!hasTopics) {
    return (
      <div className="px-4 py-24 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-app-accent-light">
          <Rss className="h-8 w-8 text-app-accent" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-app-text">Start following topics</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-app-text-muted">
          Head to Discover to pick topics that interest you and build your personal feed.
        </p>
        <Link
          href="/discover"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-app-accent px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Browse topics
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-24 text-center sm:px-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-app-accent-light">
        <Rss className="h-8 w-8 text-app-accent" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-app-text">No articles yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-app-text-muted">
        {canTriggerIngest
          ? "The ingestion pipeline hasn't run yet. Trigger it manually to fetch articles now."
          : "The ingestion pipeline runs automatically. Check back soon."}
      </p>
      {canTriggerIngest && (
        <div className="mt-6">
          <TriggerIngestButton />
        </div>
      )}
    </div>
  )
}
