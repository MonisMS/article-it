import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { topicSuggestions } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(300).optional(),
})

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

  const { name, description } = body.data

  // Case-insensitive duplicate check per user
  const existing = await db.query.topicSuggestions.findFirst({
    where: and(
      eq(topicSuggestions.userId, session.user.id),
      sql`lower(${topicSuggestions.name}) = lower(${name})`
    ),
    columns: { id: true },
  })
  if (existing) {
    return NextResponse.json({ data: null, error: "You already suggested this topic" }, { status: 409 })
  }

  const [row] = await db
    .insert(topicSuggestions)
    .values({ id: createId(), userId: session.user.id, name, description })
    .returning({ id: topicSuggestions.id })

  return NextResponse.json({ data: { id: row.id }, error: null })
}
