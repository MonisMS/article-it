import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, ThumbsUp, ThumbsDown, XCircle } from "lucide-react"
import { verifyFeedbackToken, type FeedbackRating } from "@/lib/feedback-token"
import { FeedbackAction } from "@/components/feedback-action"

export const metadata: Metadata = { title: "Feedback — Curio" }

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

  const validRating = rating === "up" || rating === "down"
  const valid = !!(userId && articleId && digestLogId && validRating && sig) &&
    verifyFeedbackToken(userId!, articleId!, digestLogId!, rating as FeedbackRating, sig!)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-stone-900 mb-10">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900 text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          Curio
        </Link>

        {valid ? (
          <>
            <div className={`flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-6 ${
              rating === "up" ? "bg-amber-50" : "bg-stone-100"
            }`}>
              {rating === "up"
                ? <ThumbsUp className="w-6 h-6 text-amber-600" />
                : <ThumbsDown className="w-6 h-6 text-stone-500" />
              }
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">
              {rating === "up" ? "Confirm thumbs up" : "Confirm thumbs down"}
            </h1>
            <FeedbackAction
              userId={userId!}
              articleId={articleId!}
              digestLogId={digestLogId!}
              rating={rating as FeedbackRating}
              sig={sig!}
            />
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
