import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { userTopics } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const schema = z.object({
  topicIds: z.array(z.string()).min(1, "Select at least one topic"),
})

// GET — fetch user's followed topics
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const data = await db.query.userTopics.findMany({
    where: eq(userTopics.userId, session.user.id),
    with: { topic: true },
  })

  return NextResponse.json({ data, error: null })
}

// POST — replace user's followed topics
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const userId = session.user.id

  // Delete existing and re-insert — clean replace
  await db.delete(userTopics).where(eq(userTopics.userId, userId))
  await db.insert(userTopics).values(
    parsed.data.topicIds.map((topicId) => ({ userId, topicId }))
  )

  return NextResponse.json({ data: { ok: true }, error: null })
}
