/**
 * __tests__/feedback-token.test.ts
 *
 * Tests for the HMAC-signed feedback URL system (lib/feedback-token.ts).
 *
 * WHY THIS NEEDS TESTS:
 * Every digest email contains 👍/👎 links. Each link carries a token that
 * proves the click came from the right user for the right article. If the
 * verification logic has a bug — accepting wrong tokens, ignoring the rating,
 * accepting tampered payloads — users can fraudulently rate articles they
 * never received, or spoof other users' feedback.
 *
 * This is security-critical code. We test both the happy path AND the attack
 * scenarios to verify the guard holds under adversarial input.
 *
 * ABOUT HMAC:
 * HMAC (Hash-based Message Authentication Code) is a one-way signature scheme.
 * Given a secret key and a message, it produces a fixed-length digest. The only
 * way to produce the same digest is to know the secret. We use the app's
 * BETTER_AUTH_SECRET as the HMAC key — if the token was not signed by this
 * server, verification will fail.
 */

import { describe, test, expect, beforeEach } from "vitest"
import {
  signFeedbackToken,
  verifyFeedbackToken,
  feedbackUrl,
  type FeedbackRating,
} from "@/lib/feedback-token"

const SECRET = "test-secret-that-is-at-least-32-chars-long"

// Stub the env var before any test runs. Each test file gets its own
// module scope, so this won't interfere with other test files.
beforeEach(() => {
  process.env.BETTER_AUTH_SECRET = SECRET
})

// ─── Fixed test fixtures ──────────────────────────────────────────────────────
// Using fixed IDs means the expected token is deterministic. If you change
// these values, re-run the tests to get the new expected token.

const USER_ID    = "user_abc123"
const ARTICLE_ID = "article_xyz789"
const LOG_ID     = "log_def456"

describe("signFeedbackToken", () => {

  test("produces a 40-character hex string", () => {
    const token = signFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "up")
    expect(token).toHaveLength(40)
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  test("is deterministic — same inputs always produce the same token", () => {
    const a = signFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "up")
    const b = signFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "up")
    expect(a).toBe(b)
  })

  test("produces different tokens for 'up' vs 'down'", () => {
    const up   = signFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "up")
    const down = signFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "down")
    expect(up).not.toBe(down)
  })

  test("produces different tokens for different users", () => {
    const a = signFeedbackToken("user_1", ARTICLE_ID, LOG_ID, "up")
    const b = signFeedbackToken("user_2", ARTICLE_ID, LOG_ID, "up")
    expect(a).not.toBe(b)
  })

  test("produces different tokens for different articles", () => {
    const a = signFeedbackToken(USER_ID, "article_1", LOG_ID, "up")
    const b = signFeedbackToken(USER_ID, "article_2", LOG_ID, "up")
    expect(a).not.toBe(b)
  })

})

describe("verifyFeedbackToken", () => {

  test("accepts a valid token", () => {
    const sig = signFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "up")
    expect(verifyFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "up", sig)).toBe(true)
  })

  test("rejects a token signed for a different rating", () => {
    // An 'up' token must NOT verify as a 'down' token.
    // Without this check, a user could flip their own vote by swapping the
    // rating param in the URL while reusing the same signature.
    const sig = signFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "up")
    expect(verifyFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "down", sig)).toBe(false)
  })

  test("rejects a token with a tampered signature", () => {
    const sig = signFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "up")
    const tampered = sig.slice(0, -4) + "0000"
    expect(verifyFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "up", tampered)).toBe(false)
  })

  test("rejects a token for a different user", () => {
    // User A's token must not verify for user B's ID.
    // This is the main fraud-prevention check.
    const sig = signFeedbackToken("user_attacker", ARTICLE_ID, LOG_ID, "up")
    expect(verifyFeedbackToken("user_victim", ARTICLE_ID, LOG_ID, "up", sig)).toBe(false)
  })

  test("rejects a token for a different article", () => {
    const sig = signFeedbackToken(USER_ID, "article_a", LOG_ID, "up")
    expect(verifyFeedbackToken(USER_ID, "article_b", LOG_ID, "up", sig)).toBe(false)
  })

  test("rejects a token for a different digest log", () => {
    // The digestLogId ties a feedback click to a specific email send.
    // Without this, a token from one digest could be replayed on another.
    const sig = signFeedbackToken(USER_ID, ARTICLE_ID, "log_old", "up")
    expect(verifyFeedbackToken(USER_ID, ARTICLE_ID, "log_new", "up", sig)).toBe(false)
  })

  test("rejects an empty signature string", () => {
    expect(verifyFeedbackToken(USER_ID, ARTICLE_ID, LOG_ID, "up", "")).toBe(false)
  })

})

describe("feedbackUrl", () => {

  test("builds a URL with all required query params", () => {
    const url = feedbackUrl("https://app.test", USER_ID, ARTICLE_ID, LOG_ID, "up")
    const parsed = new URL(url)

    expect(parsed.origin).toBe("https://app.test")
    expect(parsed.pathname).toBe("/feedback")
    expect(parsed.searchParams.get("userId")).toBe(USER_ID)
    expect(parsed.searchParams.get("articleId")).toBe(ARTICLE_ID)
    expect(parsed.searchParams.get("digestLogId")).toBe(LOG_ID)
    expect(parsed.searchParams.get("rating")).toBe("up")
    // Signature must be present and 40 hex chars
    const sig = parsed.searchParams.get("sig")
    expect(sig).toHaveLength(40)
    expect(sig).toMatch(/^[0-9a-f]+$/)
  })

  test("signature in URL verifies correctly", () => {
    const url = feedbackUrl("https://app.test", USER_ID, ARTICLE_ID, LOG_ID, "down")
    const { searchParams } = new URL(url)

    const valid = verifyFeedbackToken(
      searchParams.get("userId")!,
      searchParams.get("articleId")!,
      searchParams.get("digestLogId")!,
      searchParams.get("rating") as FeedbackRating,
      searchParams.get("sig")!
    )
    expect(valid).toBe(true)
  })

})
