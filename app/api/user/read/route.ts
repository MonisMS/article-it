import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { readArticles } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

const schema = z.object({ articleId: z.string().min(1) })

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ data: null, error: "Invalid input" }, { status: 400 })

  const { articleId } = parsed.data
  const userId = session.user.id

  // Check if already read
  const existing = await db.query.readArticles.findFirst({
    where: and(eq(readArticles.userId, userId), eq(readArticles.articleId, articleId)),
  })

  if (existing) {
    // Toggle off — unmark as read
    await db.delete(readArticles).where(
      and(eq(readArticles.userId, userId), eq(readArticles.articleId, articleId))
    )
    return NextResponse.json({ data: { read: false }, error: null })
  }

  // Mark as read
  await db.insert(readArticles).values({ userId, articleId })
  return NextResponse.json({ data: { read: true }, error: null })
}
