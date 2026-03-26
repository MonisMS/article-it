import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { articles, bookmarks } from "@/lib/db/schema"
import { and, lt, sql } from "drizzle-orm"

export const maxDuration = 300

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)

    // Delete articles older than 90 days that no user has bookmarked.
    // Bookmarked articles are kept indefinitely — the user explicitly saved them.
    const deleted = await db
      .delete(articles)
      .where(
        and(
          lt(articles.publishedAt, cutoff),
          sql`NOT EXISTS (
            SELECT 1 FROM ${bookmarks}
            WHERE ${bookmarks.articleId} = ${articles.id}
          )`
        )
      )
      .returning({ id: articles.id })

    console.log(`[cron/cleanup] Deleted ${deleted.length} articles older than 90 days`)
    return NextResponse.json({ data: { deleted: deleted.length }, error: null })
  } catch (err) {
    console.error("[cron/cleanup]", err)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}
