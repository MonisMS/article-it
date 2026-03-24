import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { bookmarks, articles } from "@/lib/db/schema"
import { and, eq, inArray, desc } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { z } from "zod"

// GET — return user's bookmarked articles
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const rows = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, session.user.id),
    with: {
      article: {
        with: {
          source: { columns: { name: true } },
          articleTopics: {
            with: { topic: { columns: { id: true, name: true, icon: true, slug: true } } },
          },
        },
      },
    },
    orderBy: (b, { desc }) => desc(b.createdAt),
  })

  return NextResponse.json({ data: rows.map((r) => r.article), error: null })
}

const toggleSchema = z.object({ articleId: z.string() })

// POST — toggle bookmark (add if missing, remove if exists)
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = toggleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: "articleId required" }, { status: 400 })
  }

  const { articleId } = parsed.data
  const userId = session.user.id

  const existing = await db.query.bookmarks.findFirst({
    where: and(eq(bookmarks.userId, userId), eq(bookmarks.articleId, articleId)),
  })

  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id))
    return NextResponse.json({ data: { bookmarked: false }, error: null })
  }

  await db.insert(bookmarks).values({ id: createId(), userId, articleId })
  return NextResponse.json({ data: { bookmarked: true }, error: null })
}
