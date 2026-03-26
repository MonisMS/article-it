import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { articles, bookmarks, readArticles, rssSources } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export const maxDuration = 300

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Compute per-source engagement rates from the last 90 days.
    // Only update sources with at least 5 total interactions (reads + bookmarks)
    // — below that threshold the signal is too noisy to trust.
    const stats = await db.execute(sql`
      SELECT
        a.source_id,
        COUNT(DISTINCT a.id)              AS article_count,
        COUNT(DISTINCT ra.article_id)     AS read_count,
        COUNT(DISTINCT b.article_id)      AS bookmark_count
      FROM ${articles} a
      LEFT JOIN ${readArticles} ra ON ra.article_id = a.id
      LEFT JOIN ${bookmarks}    b  ON b.article_id  = a.id
      WHERE a.published_at > NOW() - INTERVAL '90 days'
      GROUP BY a.source_id
      HAVING
        COUNT(DISTINCT ra.article_id) + COUNT(DISTINCT b.article_id) >= 5
    `)

    const rows = stats.rows as {
      source_id: string
      article_count: string
      read_count: string
      bookmark_count: string
    }[]

    // Update each qualifying source. Score = weighted blend of bookmark and read rates,
    // capped at 1.0. Sources below the interaction threshold keep their current score.
    let updated = 0
    for (const row of rows) {
      const articleCount = Math.max(1, Number(row.article_count))
      const score = Math.min(
        1.0,
        (Number(row.bookmark_count) * 0.6 + Number(row.read_count) * 0.4) / articleCount
      )
      await db
        .update(rssSources)
        .set({ qualityScore: score })
        .where(eq(rssSources.id, row.source_id))
      updated++
    }

    console.log(`[cron/quality] Updated quality scores for ${updated} sources`)
    return NextResponse.json({ data: { updated }, error: null })
  } catch (err) {
    console.error("[cron/quality]", err)
    return NextResponse.json({ error: "Quality score update failed" }, { status: 500 })
  }
}
