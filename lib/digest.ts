import { db } from "@/lib/db"
import { digestSchedules, digestLogs, digestLogArticles, articles, articleTopics } from "@/lib/db/schema"
import { and, eq, gte, inArray, desc, or, sql } from "drizzle-orm"
import { resend } from "@/lib/resend"
import { buildDigestEmail } from "@/lib/email/digest-template"
import { createId } from "@paralleldrive/cuid2"

export async function runDigests() {
  const now = new Date()

  // Load all active schedules with user + topic info
  const schedules = await db.query.digestSchedules.findMany({
    where: and(
      eq(digestSchedules.isActive, true),
      eq(digestSchedules.hour, now.getUTCHours())
    ),
    with: {
      user: { columns: { id: true, name: true, email: true } },
      topic: { columns: { id: true, name: true, slug: true, icon: true } },
    },
  })

  // Filter to schedules actually due today (respecting frequency + day)
  const due = schedules.filter((s) => {
    if (s.frequency === "daily") return true
    if (s.frequency === "weekly") {
      // Convert current UTC time to user's timezone to get their local day
      const localDay = parseInt(
        new Intl.DateTimeFormat("en", {
          weekday: "short",
          timeZone: s.timezone,
        })
          .format(now)
          .replace(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/, (d) =>
            String(["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(d))
          )
      )
      return localDay === s.dayOfWeek
    }
    return false
  })

  if (due.length === 0) {
    console.log("[digest] No schedules due right now")
    return { sent: 0, skipped: 0 }
  }

  let sent = 0
  let skipped = 0

  for (const schedule of due) {
    try {
      const result = await sendDigest(schedule, now)
      if (result) sent++
      else skipped++
    } catch (err) {
      console.error(`[digest] Failed for user ${schedule.user.email} topic ${schedule.topic.name}:`, err)
    }
  }

  console.log(`[digest] Done — ${sent} sent, ${skipped} skipped`)
  return { sent, skipped }
}

async function sendDigest(
  schedule: Awaited<ReturnType<typeof db.query.digestSchedules.findMany>>[number] & {
    user: { id: string; name: string; email: string }
    topic: { id: string; name: string; slug: string; icon: string | null }
  },
  now: Date
) {
  // Articles since last digest (or last 7 days if never sent)
  const since = schedule.lastSentAt
    ? schedule.lastSentAt
    : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get articles for this topic published since last digest
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      url: articles.url,
      description: articles.description,
      publishedAt: articles.publishedAt,
      sourceName: sql<string>`rss_sources.name`,
    })
    .from(articles)
    .innerJoin(
      sql`rss_sources`,
      sql`rss_sources.id = ${articles.sourceId}`
    )
    .where(
      and(
        gte(articles.publishedAt, since),
        sql`EXISTS (
          SELECT 1 FROM ${articleTopics}
          WHERE ${articleTopics.articleId} = ${articles.id}
          AND   ${articleTopics.topicId} = ${schedule.topic.id}
        )`
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(10)

  if (rows.length === 0) {
    console.log(`[digest] No new articles for ${schedule.user.email} / ${schedule.topic.name} — skipping`)
    return false
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://articleit.com"

  const { subject, html } = buildDigestEmail({
    userName: schedule.user.name,
    topicName: schedule.topic.name,
    topicIcon: schedule.topic.icon ?? "📰",
    articles: rows.map((r) => ({
      title: r.title,
      url: r.url,
      description: r.description,
      sourceName: r.sourceName,
      publishedAt: r.publishedAt,
    })),
    dashboardUrl: `${appUrl}/dashboard?topic=${schedule.topic.slug}`,
    unsubscribeUrl: `${appUrl}/settings`,
  })

  await resend.emails.send({
    from: "ArticleIt <digest@articleit.com>",
    to: schedule.user.email,
    subject,
    html,
  })

  // Log the digest
  const [log] = await db
    .insert(digestLogs)
    .values({
      id: createId(),
      scheduleId: schedule.id,
      userId: schedule.user.id,
      topicId: schedule.topic.id,
      articleCount: rows.length,
      status: "sent",
    })
    .returning()

  // Record which articles were sent
  await db.insert(digestLogArticles).values(
    rows.map((r) => ({ digestLogId: log.id, articleId: r.id }))
  )

  // Update lastSentAt on the schedule
  await db
    .update(digestSchedules)
    .set({ lastSentAt: now })
    .where(eq(digestSchedules.id, schedule.id))

  console.log(`[digest] Sent ${rows.length} articles to ${schedule.user.email} for ${schedule.topic.name}`)
  return true
}
