import Parser from "rss-parser"
import { db } from "@/lib/db"
import { articles, articleTopics, rssSources } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

const SOURCE_TIMEOUT_MS = 8_000 // abandon a source after 8 seconds

const parser = new Parser({
  timeout: SOURCE_TIMEOUT_MS,
  headers: { "User-Agent": "ArticleIt/1.0 RSS Reader" },
  customFields: {
    item: ["media:group"],
  },
})

type Source = typeof rssSources.$inferSelect & {
  rssSourceTopics: { sourceId: string; topicId: string }[]
}

// ─── Ingest all active sources ────────────────────────────────────────────────

export async function ingestAllSources() {
  const sources = await db.query.rssSources.findMany({
    where: eq(rssSources.isActive, true),
    with: { rssSourceTopics: true },
  })

  const results = await Promise.allSettled(sources.map(withTimeout))

  const succeeded  = results.filter((r) => r.status === "fulfilled").length
  const timedOut   = results.filter((r) => r.status === "rejected" && String((r as PromiseRejectedResult).reason).includes("timed out")).length
  const failed     = results.filter((r) => r.status === "rejected").length - timedOut

  console.log(
    `Ingestion done — ${succeeded} ok, ${timedOut} timed out, ${failed} failed (${sources.length} total)`
  )
  return { succeeded, timedOut, failed, total: sources.length }
}

// ─── Hard timeout wrapper ─────────────────────────────────────────────────────
// Races the real ingest against a timer. If the timer wins, the source is
// skipped and will be retried on the next cron run.

function withTimeout(source: Source): Promise<number> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`[ingest] ${source.name} timed out after ${SOURCE_TIMEOUT_MS}ms`)),
      SOURCE_TIMEOUT_MS
    )
  )
  return Promise.race([ingestSource(source), timeout]).catch((err) => {
    console.error(String(err.message ?? err))
    throw err
  })
}

// ─── Ingest a single source ───────────────────────────────────────────────────

async function ingestSource(source: Source): Promise<number> {
  const feed = await parser.parseURL(source.url)

  let newArticles = 0

  for (const item of feed.items) {
    const url = item.link?.trim()
    if (!url) continue

    const title       = item.title?.trim() || "Untitled"
    const description = (item.contentSnippet || item.summary || "").slice(0, 500)
    const imageUrl    = extractImage(item as unknown as Parser.Item & { [key: string]: unknown })
    const publishedAt = parseDate(item.pubDate || item.isoDate)

    // onConflictDoNothing = silent dedup by unique URL
    const [inserted] = await db
      .insert(articles)
      .values({ id: createId(), title, url, description, imageUrl, publishedAt, sourceId: source.id })
      .onConflictDoNothing()
      .returning()

    if (!inserted) continue
    newArticles++

    for (const { topicId } of source.rssSourceTopics) {
      await db
        .insert(articleTopics)
        .values({ articleId: inserted.id, topicId })
        .onConflictDoNothing()
    }
  }

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

function extractImage(
  item: Parser.Item & { enclosure?: { url?: string }; [key: string]: unknown }
): string | null {
  // YouTube: thumbnail lives in media:group > media:thumbnail
  const mediaGroup = item["media:group"] as Record<string, unknown> | undefined
  if (mediaGroup) {
    const thumbs = mediaGroup["media:thumbnail"] as Array<{ $: { url: string } }> | undefined
    if (thumbs?.[0]?.["$"]?.url) return thumbs[0]["$"].url
  }
  if (item.enclosure?.url) return item.enclosure.url
  const content = (item["content:encoded"] as string | undefined) || item.content || ""
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1] ?? null
}
