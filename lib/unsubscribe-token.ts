import { createHmac, timingSafeEqual } from "crypto"

function secret() {
  const s = process.env.BETTER_AUTH_SECRET
  if (!s) throw new Error("BETTER_AUTH_SECRET is not set")
  return s
}

export function signUnsubscribeToken(scheduleId: string): string {
  return createHmac("sha256", secret()).update(scheduleId).digest("hex").slice(0, 40)
}

export function verifyUnsubscribeToken(scheduleId: string, sig: string): boolean {
  try {
    const expected = signUnsubscribeToken(scheduleId)
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  } catch {
    return false
  }
}
