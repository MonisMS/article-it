import Parser from "rss-parser"
import { db } from "@/lib/db"
import { articles, articleTopics, rssSources } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "ArticleIt/1.0 RSS Reader" },
})

// ─── Ingest all active sources ────────────────────────────────────────────────

export async function ingestAllSources() {
  const sources = await db.query.rssSources.findMany({
    where: eq(rssSources.isActive, true),
    with: { rssSourceTopics: true },
  })

  const results = await Promise.allSettled(sources.map(ingestSource))

  const succeeded = results.filter((r) => r.status === "fulfilled").length
  const failed = results.filter((r) => r.status === "rejected").length

  console.log(`Ingestion done — ${succeeded} succeeded, ${failed} failed`)
  return { succeeded, failed, total: sources.length }
}

// ─── Ingest a single source ───────────────────────────────────────────────────

async function ingestSource(
  source: typeof rssSources.$inferSelect & {
    rssSourceTopics: { sourceId: string; topicId: string }[]
  }
) {
  let feed
  try {
    feed = await parser.parseURL(source.url)
  } catch (err) {
    console.error(`[ingest] Failed to fetch ${source.url}:`, err)
    throw err
  }

  let newArticles = 0

  for (const item of feed.items) {
    const url = item.link?.trim()
    if (!url) continue

    const title = item.title?.trim() || "Untitled"
    const description = (item.contentSnippet || item.summary || "").slice(0, 500)
    const imageUrl = extractImage(item)
    const publishedAt = parseDate(item.pubDate || item.isoDate)

    // Insert article — skip silently if URL already exists (dedup)
    const [inserted] = await db
      .insert(articles)
      .values({
        id: createId(),
        title,
        url,
        description,
        imageUrl,
        publishedAt,
        sourceId: source.id,
      })
      .onConflictDoNothing()
      .returning()

    if (!inserted) continue
    newArticles++

    // Tag article with all topics this source feeds into
    for (const { topicId } of source.rssSourceTopics) {
      await db
        .insert(articleTopics)
        .values({ articleId: inserted.id, topicId })
        .onConflictDoNothing()
    }
  }

  // Update lastFetchedAt regardless of new article count
  await db
    .update(rssSources)
    .set({ lastFetchedAt: new Date() })
    .where(eq(rssSources.id, source.id))

  console.log(`[ingest] ${source.name} — ${newArticles} new articles`)
  return newArticles
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(dateStr?: string): Date {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

function extractImage(item: Parser.Item & { enclosure?: { url?: string }; [key: string]: unknown }): string | null {
  // Some feeds put images in enclosure
  if (item.enclosure?.url) return item.enclosure.url
  // Try to pull first <img> src from content
  const content = (item["content:encoded"] as string | undefined) || item.content || ""
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1] ?? null
}
