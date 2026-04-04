import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema/auth"
import { readArticles, userTopics, topics, articleTopics } from "@/lib/db/schema"
import { and, eq, lt, isNull, or, gte, sql, count } from "drizzle-orm"
import { resend } from "@/lib/resend"
import { buildReengageEmail } from "@/lib/email/reengage-template"

export const maxDuration = 300

const FROM = "ArticleIt <digest@m0nis.com>"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://articleit.com"
  const now = new Date()
  const lapsedCutoff = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000) // 21 days ago
  const reengageCooldown = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  const minAgeCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // joined > 7 days ago

  try {
    // Find lapsed users:
    // - Have at least one followed topic
    // - Haven't received a re-engagement email in 30 days (or never)
    // - Either: last read > 21 days ago, OR: never read + account > 7 days old
    const lapsedUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        lastReengagementAt: user.lastReengagementAt,
      })
      .from(user)
      .where(
        and(
          // Not re-engaged recently
          or(
            isNull(user.lastReengagementAt),
            lt(user.lastReengagementAt, reengageCooldown)
          ),
          // Account is old enough (no day-1 re-engagement)
          lt(user.createdAt, minAgeCutoff),
          // Has followed at least one topic
          sql`EXISTS (
            SELECT 1 FROM ${userTopics}
            WHERE ${userTopics.userId} = ${user.id}
          )`,
          // Either last read is old, or never read
          or(
            sql`(
              SELECT MAX(${readArticles.readAt}) FROM ${readArticles}
              WHERE ${readArticles.userId} = ${user.id}
            ) < ${lapsedCutoff}`,
            sql`NOT EXISTS (
              SELECT 1 FROM ${readArticles}
              WHERE ${readArticles.userId} = ${user.id}
            )`
          )
        )
      )
      .limit(100) // cap per run to stay within email sending limits

    if (lapsedUsers.length === 0) {
      console.log("[cron/reengage] No lapsed users found")
      return NextResponse.json({ data: { sent: 0 }, error: null })
    }

    let sent = 0
    let failed = 0

    for (const u of lapsedUsers) {
      try {
        // Get user's followed topics with new article counts since lapsed cutoff
        const followedTopics = await db
          .select({ topicId: userTopics.topicId })
          .from(userTopics)
          .where(eq(userTopics.userId, u.id))

        if (followedTopics.length === 0) continue

        const topicIds = followedTopics.map((t) => t.topicId)

        // Get last read date for this user to calculate "since"
        const [lastReadRow] = await db
          .select({ lastReadAt: sql<Date | null>`MAX(${readArticles.readAt})` })
          .from(readArticles)
          .where(eq(readArticles.userId, u.id))

        const sinceDate = lastReadRow?.lastReadAt
          ? new Date(lastReadRow.lastReadAt)
          : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // default to 30 days if never read

        // Count new articles per topic since their last read
        const topicCounts = await db
          .select({
            topicId: articleTopics.topicId,
            newCount: count(),
          })
          .from(articleTopics)
          .where(
            and(
              sql`${articleTopics.topicId} = ANY(${sql`ARRAY[${sql.join(topicIds.map((id) => sql`${id}`), sql`, `)}]::text[]`})`,
              sql`EXISTS (
                SELECT 1 FROM articles a
                WHERE a.id = ${articleTopics.articleId}
                AND a.published_at >= ${sinceDate}
              )`
            )
          )
          .groupBy(articleTopics.topicId)

        const countMap = Object.fromEntries(topicCounts.map((r) => [r.topicId, r.newCount]))
        const totalNew = Object.values(countMap).reduce((a, b) => a + b, 0)

        // Skip if nothing new to show
        if (totalNew === 0) continue

        // Fetch topic metadata for followed topics that have new articles
        const topicDetails = await db
          .select({ id: topics.id, name: topics.name, icon: topics.icon })
          .from(topics)
          .where(
            sql`${topics.id} = ANY(${sql`ARRAY[${sql.join(topicIds.map((id) => sql`${id}`), sql`, `)}]::text[]`})`
          )

        const topicSummaries = topicDetails
          .map((t) => ({
            name: t.name,
            icon: t.icon ?? "📄",
            newArticles: countMap[t.id] ?? 0,
          }))
          .filter((t) => t.newArticles > 0)
          .sort((a, b) => b.newArticles - a.newArticles)

        // Compute days since last read
        const daysSinceRead = lastReadRow?.lastReadAt
          ? Math.floor((now.getTime() - new Date(lastReadRow.lastReadAt).getTime()) / 86400000)
          : null

        const { subject, html } = buildReengageEmail({
          userName: u.name,
          topics: topicSummaries,
          totalNew,
          daysSinceRead,
          dashboardUrl: `${appUrl}/dashboard`,
          settingsUrl: `${appUrl}/settings`,
        })

        const { error } = await resend.emails.send({
          from: FROM,
          to: u.email,
          subject,
          html,
        })

        if (error) {
          console.error(`[cron/reengage] Failed to send to ${u.email}:`, error)
          failed++
          continue
        }

        // Stamp last reengagement time
        await db
          .update(user)
          .set({ lastReengagementAt: now })
          .where(eq(user.id, u.id))

        sent++
        console.log(`[cron/reengage] Sent to ${u.email} (${totalNew} new articles, ${daysSinceRead ?? "?"} days lapsed)`)
      } catch (userErr) {
        console.error(`[cron/reengage] Error processing user ${u.id}:`, userErr)
        failed++
      }
    }

    console.log(`[cron/reengage] Done. Sent: ${sent}, Failed: ${failed}, Skipped: ${lapsedUsers.length - sent - failed}`)
    return NextResponse.json({ data: { sent, failed }, error: null })
  } catch (err) {
    console.error("[cron/reengage]", err)
    return NextResponse.json({ error: "Re-engagement cron failed" }, { status: 500 })
  }
}
