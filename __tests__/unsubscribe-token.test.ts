/**
 * __tests__/unsubscribe-token.test.ts
 *
 * Tests for the HMAC-signed unsubscribe URL system (lib/unsubscribe-token.ts).
 *
 * WHY THIS NEEDS TESTS:
 * Each digest email has an unsubscribe link. That link carries a signature
 * proving the click came from the right user for the right schedule. If
 * verification is broken — accepting any token, ignoring the schedule ID —
 * anyone who knows a schedule ID (which is just a CUID, not secret) could
 * unsubscribe another user without their consent.
 *
 * The unsubscribe token is simpler than the feedback token (just scheduleId),
 * but the security properties are the same: only a valid HMAC signature from
 * this server should pass verification.
 */

import { describe, test, expect, beforeEach } from "vitest"
import { signUnsubscribeToken, verifyUnsubscribeToken } from "@/lib/unsubscribe-token"

beforeEach(() => {
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-at-least-32-chars-long"
})

const SCHEDULE_ID = "schedule_abc123def456"

describe("signUnsubscribeToken", () => {

  test("produces a 40-character hex string", () => {
    const token = signUnsubscribeToken(SCHEDULE_ID)
    expect(token).toHaveLength(40)
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  test("is deterministic for the same scheduleId", () => {
    expect(signUnsubscribeToken(SCHEDULE_ID)).toBe(signUnsubscribeToken(SCHEDULE_ID))
  })

  test("produces different tokens for different schedule IDs", () => {
    expect(signUnsubscribeToken("schedule_a")).not.toBe(signUnsubscribeToken("schedule_b"))
  })

  test("produces different tokens when the secret changes", () => {
    const tokenA = signUnsubscribeToken(SCHEDULE_ID)
    process.env.BETTER_AUTH_SECRET = "completely-different-secret-value"
    const tokenB = signUnsubscribeToken(SCHEDULE_ID)
    expect(tokenA).not.toBe(tokenB)
  })

})

describe("verifyUnsubscribeToken", () => {

  test("accepts a valid token", () => {
    const sig = signUnsubscribeToken(SCHEDULE_ID)
    expect(verifyUnsubscribeToken(SCHEDULE_ID, sig)).toBe(true)
  })

  test("rejects a tampered signature", () => {
    const sig = signUnsubscribeToken(SCHEDULE_ID)
    const tampered = "a".repeat(40)
    expect(verifyUnsubscribeToken(SCHEDULE_ID, tampered)).toBe(false)
  })

  test("rejects a token signed for a different schedule", () => {
    // If a user somehow gets a valid token for schedule A, they must not be
    // able to use it to unsubscribe schedule B.
    const sig = signUnsubscribeToken("schedule_other")
    expect(verifyUnsubscribeToken(SCHEDULE_ID, sig)).toBe(false)
  })

  test("rejects an empty signature", () => {
    expect(verifyUnsubscribeToken(SCHEDULE_ID, "")).toBe(false)
  })

})
