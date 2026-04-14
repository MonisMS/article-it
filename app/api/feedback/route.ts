import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { articleFeedback } from "@/lib/db/schema"
import { verifyFeedbackToken, type FeedbackRating } from "@/lib/feedback-token"
import { z } from "zod"

const schema = z.object({
  userId: z.string().min(1),
  articleId: z.string().min(1),
  digestLogId: z.string().min(1),
  rating: z.enum(["up", "down"]),
  sig: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = schema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ data: null, error: "Invalid input" }, { status: 400 })
    }

    const { userId, articleId, digestLogId, rating, sig } = body.data
    const valid = verifyFeedbackToken(userId, articleId, digestLogId, rating as FeedbackRating, sig)
    if (!valid) {
      return NextResponse.json({ data: null, error: "Invalid or expired link" }, { status: 400 })
    }

    await db
      .insert(articleFeedback)
      .values({ userId, articleId, digestLogId, rating })
      .onConflictDoUpdate({
        target: [articleFeedback.userId, articleFeedback.articleId, articleFeedback.digestLogId],
        set: { rating },
      })

    return NextResponse.json({ data: { ok: true }, error: null })
  } catch (err) {
    console.error("[api/feedback]", err)
    return NextResponse.json({ data: null, error: "Failed to save feedback" }, { status: 500 })
  }
}