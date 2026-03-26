import { db } from "@/lib/db"
import { readArticles, articleTopics, userTopics, topics, rssSources, articles } from "@/lib/db/schema"
import { eq, gte, and, desc, count } from "drizzle-orm"

export type ReadingInsightsData = {
  readLast7Days: number
  readLast30Days: number
  totalReads: number
  topTopicName: string | null
  topTopicIcon: string | null
  mostReadSourceName: string | null
  ignoredTopics: { id: string; name: string; icon: string | null; slug: string }[]
  topicReadCounts: { topicId: string; name: string; icon: string | null; count: number }[]
}

export async function getReadingInsights(userId: string): Promise<ReadingInsightsData> {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    readLast7,
    readLast30,
    totalReads,
    topicCounts,
    mostReadSource,
    followedTopics,
  ] = await Promise.all([
    // Articles read in last 7 days
    db
      .select({ count: count() })
      .from(readArticles)
      .where(and(eq(readArticles.userId, userId), gte(readArticles.readAt, sevenDaysAgo)))
      .then((r) => r[0]?.count ?? 0),

    // Articles read in last 30 days
    db
      .select({ count: count() })
      .from(readArticles)
      .where(and(eq(readArticles.userId, userId), gte(readArticles.readAt, thirtyDaysAgo)))
      .then((r) => r[0]?.count ?? 0),

    // Total reads all time
    db
      .select({ count: count() })
      .from(readArticles)
      .where(eq(readArticles.userId, userId))
      .then((r) => r[0]?.count ?? 0),

    // Per-topic read counts in last 30 days
    db
      .select({
        topicId: articleTopics.topicId,
        name: topics.name,
        icon: topics.icon,
        count: count(readArticles.articleId),
      })
      .from(readArticles)
      .innerJoin(articleTopics, eq(articleTopics.articleId, readArticles.articleId))
      .innerJoin(topics, eq(topics.id, articleTopics.topicId))
      .where(and(eq(readArticles.userId, userId), gte(readArticles.readAt, thirtyDaysAgo)))
      .groupBy(articleTopics.topicId, topics.name, topics.icon)
      .orderBy(desc(count(readArticles.articleId))),

    // Most-read source in last 30 days
    db
      .select({ name: rssSources.name, count: count(readArticles.articleId) })
      .from(readArticles)
      .innerJoin(articles, eq(articles.id, readArticles.articleId))
      .innerJoin(rssSources, eq(rssSources.id, articles.sourceId))
      .where(and(eq(readArticles.userId, userId), gte(readArticles.readAt, thirtyDaysAgo)))
      .groupBy(rssSources.name)
      .orderBy(desc(count(readArticles.articleId)))
      .limit(1)
      .then((r) => r[0] ?? null),

    // All topics the user follows (with topic meta)
    db
      .select({ topicId: userTopics.topicId, name: topics.name, icon: topics.icon, slug: topics.slug })
      .from(userTopics)
      .innerJoin(topics, eq(topics.id, userTopics.topicId))
      .where(eq(userTopics.userId, userId)),
  ])

  // Topics the user follows but has 0 reads from in last 30 days
  const readTopicIdsLast30 = new Set(
    topicCounts
      .filter((t) => t.count > 0)
      .map((t) => t.topicId)
  )
  const ignoredTopics = followedTopics
    .filter((t) => !readTopicIdsLast30.has(t.topicId))
    .map((t) => ({ id: t.topicId, name: t.name, icon: t.icon, slug: t.slug }))

  const topTopic = topicCounts[0] ?? null

  return {
    readLast7Days: readLast7,
    readLast30Days: readLast30,
    totalReads: totalReads,
    topTopicName: topTopic?.name ?? null,
    topTopicIcon: topTopic?.icon ?? null,
    mostReadSourceName: mostReadSource?.name ?? null,
    ignoredTopics,
    topicReadCounts: topicCounts.map((t) => ({
      topicId: t.topicId,
      name: t.name,
      icon: t.icon,
      count: t.count,
    })),
  }
}
