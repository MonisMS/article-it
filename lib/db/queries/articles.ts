import { db } from "@/lib/db"
import { articles, articleTopics, userTopics, topics, rssSources, bookmarks, readArticles } from "@/lib/db/schema"
import { eq, inArray, desc, sql } from "drizzle-orm"

export type ArticleWithMeta = Awaited<ReturnType<typeof getArticlesForUser>>[number]

export async function getArticlesForUser(
  userId: string,
  topicSlug?: string,
  page = 0
) {
  const limit = 20
  const offset = page * limit

  // 1. Get user's followed topic IDs
  const followed = await db
    .select({ topicId: userTopics.topicId })
    .from(userTopics)
    .where(eq(userTopics.userId, userId))

  if (followed.length === 0) return []

  const userTopicIds = followed.map((f) => f.topicId)

  // 2. Resolve filter topic IDs
  let filterTopicIds = userTopicIds
  let primaryTopicId: string | undefined

  if (topicSlug) {
    const topic = await db.query.topics.findFirst({
      where: eq(topics.slug, topicSlug),
    })
    if (!topic || !userTopicIds.includes(topic.id)) return []
    filterTopicIds = [topic.id]
    primaryTopicId = topic.id
  }

  // 3. Single query — articles that have at least one matching topic
  //    using EXISTS so we don't pull thousands of IDs into memory
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      url: articles.url,
      description: articles.description,
      imageUrl: articles.imageUrl,
      publishedAt: articles.publishedAt,
      sourceName: rssSources.name,
    })
    .from(articles)
    .innerJoin(rssSources, eq(rssSources.id, articles.sourceId))
    .where(
      sql`EXISTS (
        SELECT 1 FROM ${articleTopics}
        WHERE ${articleTopics.articleId} = ${articles.id}
        AND   ${articleTopics.topicId}   IN ${sql.raw(
          `('${filterTopicIds.join("','")}')`
        )}
      )`
    )
    // Blend recency with source quality: high-quality sources get up to +12h
    // virtual freshness so they surface slightly above same-age lower-trust sources.
    // All sources default to 0.5 (neutral, +6h) until the quality cron runs.
    .orderBy(
      desc(
        sql`${articles.publishedAt} + (COALESCE(${rssSources.qualityScore}, 0.5) * INTERVAL '12 hours')`
      )
    )
    .limit(limit)
    .offset(offset)

  if (rows.length === 0) return []

  // 4. Fetch topics for those articles in one query
  const articleIds = rows.map((r) => r.id)
  const tagRows = await db
    .select({
      articleId: articleTopics.articleId,
      topicId:   topics.id,
      topicName: topics.name,
      topicIcon: topics.icon,
      topicSlug: topics.slug,
    })
    .from(articleTopics)
    .innerJoin(topics, eq(topics.id, articleTopics.topicId))
    .where(inArray(articleTopics.articleId, articleIds))

  // Build a map articleId → topics[]
  const topicMap = new Map<string, { id: string; name: string; icon: string | null; slug: string }[]>()
  for (const row of tagRows) {
    if (!topicMap.has(row.articleId)) topicMap.set(row.articleId, [])
    topicMap.get(row.articleId)!.push({
      id: row.topicId,
      name: row.topicName,
      icon: row.topicIcon,
      slug: row.topicSlug,
    })
  }

  // 5. Merge — put the active filter topic first so the card always shows the right badge
  return rows.map((row) => {
    const allTopics = topicMap.get(row.id) ?? []
    const sorted = primaryTopicId
      ? [
          ...allTopics.filter((t) => t.id === primaryTopicId),
          ...allTopics.filter((t) => t.id !== primaryTopicId),
        ]
      : allTopics
    return { ...row, source: { name: row.sourceName }, articleTopics: sorted }
  })
}

export async function getArticlesByTopicSlug(topicSlug: string, page = 0) {
  const limit = 20
  const offset = page * limit

  const topic = await db.query.topics.findFirst({ where: eq(topics.slug, topicSlug) })
  if (!topic) return { topic: null, articles: [] }

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      url: articles.url,
      description: articles.description,
      imageUrl: articles.imageUrl,
      publishedAt: articles.publishedAt,
      sourceName: rssSources.name,
    })
    .from(articles)
    .innerJoin(rssSources, eq(rssSources.id, articles.sourceId))
    .where(
      sql`EXISTS (
        SELECT 1 FROM ${articleTopics}
        WHERE ${articleTopics.articleId} = ${articles.id}
        AND   ${articleTopics.topicId} = ${topic.id}
      )`
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset)

  return {
    topic,
    articles: rows.map((r) => ({
      ...r,
      source: { name: r.sourceName },
      articleTopics: [{ id: topic.id, name: topic.name, icon: topic.icon, slug: topic.slug }],
    })),
  }
}

export async function getArticlesCountForUser(userId: string, topicSlug?: string): Promise<number> {
  const followed = await db
    .select({ topicId: userTopics.topicId })
    .from(userTopics)
    .where(eq(userTopics.userId, userId))

  if (followed.length === 0) return 0

  const userTopicIds = followed.map((f) => f.topicId)
  let filterTopicIds = userTopicIds

  if (topicSlug) {
    const topic = await db.query.topics.findFirst({ where: eq(topics.slug, topicSlug) })
    if (!topic || !userTopicIds.includes(topic.id)) return 0
    filterTopicIds = [topic.id]
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(
      sql`EXISTS (
        SELECT 1 FROM ${articleTopics}
        WHERE ${articleTopics.articleId} = ${articles.id}
        AND   ${articleTopics.topicId} IN ${sql.raw(`('${filterTopicIds.join("','")}')`)}
      )`
    )

  return Number(result?.count ?? 0)
}

export async function getBookmarkedArticleIds(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ articleId: bookmarks.articleId })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
  return new Set(rows.map((r) => r.articleId))
}

export async function getReadArticleIds(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ articleId: readArticles.articleId })
    .from(readArticles)
    .where(eq(readArticles.userId, userId))
  return new Set(rows.map((r) => r.articleId))
}

export async function searchArticles(query: string, page = 0) {
  const limit = 20
  const offset = page * limit

  const tsQuery = sql`plainto_tsquery('english', ${query})`
  const tsVector = sql`to_tsvector('english', coalesce(${articles.title}, '') || ' ' || coalesce(${articles.description}, ''))`

  const rows = await db
    .select({
      id:          articles.id,
      title:       articles.title,
      url:         articles.url,
      description: articles.description,
      imageUrl:    articles.imageUrl,
      publishedAt: articles.publishedAt,
      sourceName:  rssSources.name,
    })
    .from(articles)
    .innerJoin(rssSources, eq(rssSources.id, articles.sourceId))
    .where(sql`${tsVector} @@ ${tsQuery}`)
    .orderBy(desc(sql`ts_rank(${tsVector}, ${tsQuery})`))
    .limit(limit)
    .offset(offset)

  if (rows.length === 0) return []

  const articleIds = rows.map((r) => r.id)
  const tagRows = await db
    .select({
      articleId: articleTopics.articleId,
      topicId:   topics.id,
      topicName: topics.name,
      topicIcon: topics.icon,
      topicSlug: topics.slug,
    })
    .from(articleTopics)
    .innerJoin(topics, eq(topics.id, articleTopics.topicId))
    .where(inArray(articleTopics.articleId, articleIds))

  const topicMap = new Map<string, { id: string; name: string; icon: string | null; slug: string }[]>()
  for (const row of tagRows) {
    if (!topicMap.has(row.articleId)) topicMap.set(row.articleId, [])
    topicMap.get(row.articleId)!.push({ id: row.topicId, name: row.topicName, icon: row.topicIcon, slug: row.topicSlug })
  }

  return rows.map((row) => ({
    ...row,
    source: { name: row.sourceName },
    articleTopics: topicMap.get(row.id) ?? [],
  }))
}

export async function getUserTopicsWithMeta(userId: string) {
  return db.query.userTopics.findMany({
    where: eq(userTopics.userId, userId),
    with: {
      topic: { columns: { id: true, name: true, slug: true, icon: true } },
    },
  })
}
