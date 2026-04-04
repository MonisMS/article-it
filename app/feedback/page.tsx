import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, ThumbsUp, ThumbsDown, XCircle } from "lucide-react"
import { db } from "@/lib/db"
import { articleFeedback } from "@/lib/db/schema"
import { verifyFeedbackToken, type FeedbackRating } from "@/lib/feedback-token"
import { eq, and } from "drizzle-orm"

export const metadata: Metadata = { title: "Feedback — ArticleIt" }

type Props = {
  searchParams: Promise<{
    userId?: string
    articleId?: string
    digestLogId?: string
    rating?: string
    sig?: string
  }>
}

export default async function FeedbackPage({ searchParams }: Props) {
  const { userId, articleId, digestLogId, rating, sig } = await searchParams

  let success = false
  let isUp = false

  const validRating = rating === "up" || rating === "down"

  if (userId && articleId && digestLogId && validRating && sig) {
    const r = rating as FeedbackRating
    if (verifyFeedbackToken(userId, articleId, digestLogId, r, sig)) {
      isUp = r === "up"
      // Upsert — if they rated before, update it
      await db
        .insert(articleFeedback)
        .values({ userId, articleId, digestLogId, rating: r })
        .onConflictDoUpdate({
          target: [articleFeedback.userId, articleFeedback.articleId, articleFeedback.digestLogId],
          set: { rating: r },
        })
      success = true
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-stone-900 mb-10">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900 text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          ArticleIt
        </Link>

        {success ? (
          <>
            <div className={`flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-6 ${
              isUp ? "bg-amber-50" : "bg-stone-100"
            }`}>
              {isUp
                ? <ThumbsUp className="w-6 h-6 text-amber-600" />
                : <ThumbsDown className="w-6 h-6 text-stone-500" />
              }
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">
              {isUp ? "Glad you liked it!" : "Thanks for the feedback"}
            </h1>
            <p className="text-sm text-stone-500 leading-relaxed mb-8">
              {isUp
                ? "We'll use this to surface more articles like this in your digest."
                : "We'll use this to improve what lands in your digest."
              }
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mx-auto mb-6">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Invalid link</h1>
            <p className="text-sm text-stone-500 leading-relaxed mb-8">
              This feedback link is invalid or expired.
            </p>
          </>
        )}

        <Link
          href="/dashboard"
          className="text-sm font-medium text-stone-700 border border-stone-200 rounded-lg px-4 py-2.5 hover:bg-stone-100 transition-colors"
        >
          Go to your feed →
        </Link>
      </div>
    </div>
  )
}
