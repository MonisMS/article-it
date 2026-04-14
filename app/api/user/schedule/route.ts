import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { digestSchedules, userTopics, topics } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"

const schema = z.object({
  frequency: z.enum(["daily", "weekly"]),
  dayOfWeek: z.number().min(0).max(6).nullable(),
  hour: z.number().min(0).max(23),
  timezone: z.string().min(1),
  // Optional: if provided, update only this topic's schedule. Otherwise update all.
  topicId: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const userId = session.user.id
  const { frequency, dayOfWeek, hour, timezone, topicId } = parsed.data

  // Determine which topic IDs to upsert
  let topicIds: string[]
  if (topicId) {
    const topic = await db.query.topics.findFirst({
      where: and(eq(topics.id, topicId), eq(topics.isActive, true)),
      columns: { id: true },
    })
    if (!topic) {
      return NextResponse.json({ data: null, error: "Topic not found" }, { status: 404 })
    }
    topicIds = [topicId]
  } else {
    const followed = await db.query.userTopics.findMany({ where: eq(userTopics.userId, userId) })
    if (followed.length === 0) {
      return NextResponse.json({ data: null, error: "No topics followed" }, { status: 400 })
    }
    topicIds = followed.map((f) => f.topicId)
  }

  for (const tid of topicIds) {
    await db
      .insert(digestSchedules)
      .values({
        userId,
        topicId: tid,
        frequency,
        dayOfWeek: frequency === "weekly" ? dayOfWeek : null,
        hour,
        timezone,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [digestSchedules.userId, digestSchedules.topicId],
        set: {
          frequency,
          dayOfWeek: frequency === "weekly" ? dayOfWeek : null,
          hour,
          timezone,
          isActive: true,
          updatedAt: new Date(),
        },
      })
  }

  return NextResponse.json({ data: { ok: true }, error: null })
}

const patchSchema = z.object({
  topicIds: z.array(z.string().min(1)),
  isActive: z.boolean(),
})

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { topicIds, isActive } = parsed.data
  for (const topicId of topicIds) {
    await db
      .update(digestSchedules)
      .set({ isActive, updatedAt: new Date() })
      .where(and(eq(digestSchedules.userId, session.user.id), eq(digestSchedules.topicId, topicId)))
  }

  return NextResponse.json({ data: { ok: true }, error: null })
}

const deleteSchema = z.object({ topicId: z.string().min(1) })

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { topicId } = parsed.data
  await db
    .delete(digestSchedules)
    .where(and(eq(digestSchedules.userId, session.user.id), eq(digestSchedules.topicId, topicId)))

  return NextResponse.json({ data: { ok: true }, error: null })
}
