import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { digestSchedules, userTopics } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const schema = z.object({
  frequency: z.enum(["daily", "weekly"]),
  dayOfWeek: z.number().min(0).max(6).nullable(),
  hour: z.number().min(0).max(23),
  timezone: z.string().min(1),
})

// POST — create/update digest schedule for all user topics
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const userId = session.user.id
  const { frequency, dayOfWeek, hour, timezone } = parsed.data

  // Get all topics this user follows
  const followed = await db.query.userTopics.findMany({
    where: eq(userTopics.userId, userId),
  })

  if (followed.length === 0) {
    return NextResponse.json({ data: null, error: "No topics followed" }, { status: 400 })
  }

  // Upsert one schedule per topic
  for (const { topicId } of followed) {
    await db
      .insert(digestSchedules)
      .values({
        userId,
        topicId,
        frequency,
        dayOfWeek: frequency === "weekly" ? dayOfWeek : null,
        hour,
        timezone,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [digestSchedules.userId, digestSchedules.topicId],
        set: { frequency, dayOfWeek: frequency === "weekly" ? dayOfWeek : null, hour, timezone, isActive: true },
      })
  }

  return NextResponse.json({ data: { ok: true }, error: null })
}
