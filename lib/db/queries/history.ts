import { db } from "@/lib/db"
import { digestLogs, digestLogArticles } from "@/lib/db/schema"
import { and, eq, desc } from "drizzle-orm"

const PAGE_SIZE = 20

export type DigestLogRow = {
  id: string
  topic: { name: string; icon: string | null; slug: string }
  sentAt: Date
  articleCount: number
  status: string
}

export type DigestLogArticle = {
  id: string
  title: string
  url: string
  publishedAt: Date | null
  sourceName: string
}

export async function getDigestLogsForUser(
  userId: string,
  page = 0
): Promise<{ logs: DigestLogRow[]; hasMore: boolean }> {
  const rows = await db.query.digestLogs.findMany({
    where: eq(digestLogs.userId, userId),
    with: {
      topic: { columns: { name: true, icon: true, slug: true } },
    },
    orderBy: (t, { desc }) => desc(t.sentAt),
    limit: PAGE_SIZE + 1,
    offset: page * PAGE_SIZE,
  })

  const hasMore = rows.length > PAGE_SIZE
  const logs = rows.slice(0, PAGE_SIZE).map((r) => ({
    id: r.id,
    topic: r.topic,
    sentAt: r.sentAt,
    articleCount: r.articleCount,
    status: r.status,
  }))

  return { logs, hasMore }
}

export async function getDigestLogArticles(
  logId: string,
  userId: string
): Promise<DigestLogArticle[] | null> {
  // Ownership check
  const log = await db.query.digestLogs.findFirst({
    where: and(eq(digestLogs.id, logId), eq(digestLogs.userId, userId)),
    columns: { id: true },
  })
  if (!log) return null

  const rows = await db.query.digestLogArticles.findMany({
    where: eq(digestLogArticles.digestLogId, logId),
    with: {
      article: {
        columns: { id: true, title: true, url: true, publishedAt: true },
        with: { source: { columns: { name: true } } },
      },
    },
  })

  return rows.map((r) => ({
    id: r.article.id,
    title: r.article.title,
    url: r.article.url,
    publishedAt: r.article.publishedAt,
    sourceName: r.article.source.name,
  }))
}
