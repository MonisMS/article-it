import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { articles, articleTopics, userTopics, topics, rssSources } from "@/lib/db/schema"
import { and, eq, desc, sql } from "drizzle-orm"
import { buildDigestEmail } from "@/lib/email/digest-template"
import { z } from "zod"

const schema = z.object({ topicId: z.string().min(1) })

export async function POST(req: Request) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })
  }
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const body = schema.safeParse(await req.json())
  if (!body.success) {
    return NextResponse.json({ data: null, error: "Invalid input" }, { status: 400 })
  }

  const { topicId } = body.data

  // Verify user follows this topic
  const followed = await db.query.userTopics.findFirst({
    where: and(eq(userTopics.userId, session.user.id), eq(userTopics.topicId, topicId)),
    columns: { topicId: true },
  })
  if (!followed) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
  }

  const topic = await db.query.topics.findFirst({
    where: eq(topics.id, topicId),
    columns: { name: true, icon: true, slug: true },
  })
  if (!topic) {
    return NextResponse.json({ data: null, error: "Topic not found" }, { status: 404 })
  }

  // Fetch 10 most recent articles for this topic (no date filter — preview shows latest)
  const rows = await db
    .select({
      title: articles.title,
      url: articles.url,
      description: articles.description,
      publishedAt: articles.publishedAt,
      sourceName: rssSources.name,
    })
    .from(articles)
    .innerJoin(rssSources, eq(rssSources.id, articles.sourceId))
    .where(
      sql`EXISTS (
        SELECT 1 FROM ${articleTopics}
        WHERE ${articleTopics.articleId} = ${articles.id}
        AND   ${articleTopics.topicId}   = ${topicId}
      )`
    )
    .orderBy(desc(articles.publishedAt))
    .limit(10)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""

  const { subject, html } = buildDigestEmail({
    userName: session.user.name,
    topicName: topic.name,
    topicIcon: topic.icon ?? "📰",
    articles: rows,
    dashboardUrl: `${appUrl}/dashboard?topic=${topic.slug}`,
    unsubscribeUrl: "#preview",
  })

  return NextResponse.json({ data: { subject, html }, error: null })
}
