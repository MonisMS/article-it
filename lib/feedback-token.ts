import { createHmac, timingSafeEqual } from "crypto"

function secret() {
  const s = process.env.BETTER_AUTH_SECRET
  if (!s) throw new Error("BETTER_AUTH_SECRET is not set")
  return s
}

export type FeedbackRating = "up" | "down"

/** Sign a feedback token for userId:articleId:digestLogId:rating */
export function signFeedbackToken(
  userId: string,
  articleId: string,
  digestLogId: string,
  rating: FeedbackRating
): string {
  const payload = `${userId}:${articleId}:${digestLogId}:${rating}`
  return createHmac("sha256", secret()).update(payload).digest("hex").slice(0, 40)
}

export function verifyFeedbackToken(
  userId: string,
  articleId: string,
  digestLogId: string,
  rating: FeedbackRating,
  sig: string
): boolean {
  try {
    const expected = signFeedbackToken(userId, articleId, digestLogId, rating)
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  } catch {
    return false
  }
}

/** Build a full feedback URL for inclusion in digest emails */
export function feedbackUrl(
  appUrl: string,
  userId: string,
  articleId: string,
  digestLogId: string,
  rating: FeedbackRating
): string {
  const sig = signFeedbackToken(userId, articleId, digestLogId, rating)
  const params = new URLSearchParams({ userId, articleId, digestLogId, rating, sig })
  return `${appUrl}/feedback?${params}`
}
