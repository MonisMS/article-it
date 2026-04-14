import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { digestSchedules } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token"
import { z } from "zod"

const schema = z.object({
  id: z.string().min(1),
  sig: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = schema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ data: null, error: "Invalid input" }, { status: 400 })
    }

    const { id, sig } = body.data
    if (!verifyUnsubscribeToken(id, sig)) {
      return NextResponse.json({ data: null, error: "Invalid or expired link" }, { status: 400 })
    }

    const schedule = await db.query.digestSchedules.findFirst({
      where: eq(digestSchedules.id, id),
      with: { topic: { columns: { name: true } } },
    })

    if (!schedule) {
      return NextResponse.json({ data: null, error: "Schedule not found" }, { status: 404 })
    }

    if (schedule.isActive) {
      await db
        .update(digestSchedules)
        .set({ isActive: false })
        .where(eq(digestSchedules.id, id))
    }

    return NextResponse.json({ data: { ok: true, topicName: schedule.topic.name }, error: null })
  } catch (err) {
    console.error("[api/unsubscribe]", err)
    return NextResponse.json({ data: null, error: "Failed to update subscription" }, { status: 500 })
  }
}