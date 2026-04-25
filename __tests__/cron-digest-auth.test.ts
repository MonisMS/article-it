/**
 * __tests__/cron-digest-auth.test.ts
 *
 * Tests for the digest cron route's authentication check.
 * File: app/api/cron/digest/route.ts
 *
 * WHY THIS NEEDS TESTS:
 * The digest cron sends emails to every user who has a schedule due at the
 * current hour. If the auth check fails open, anyone on the internet can
 * trigger mass email sending, exhaust your Resend quota, and spam users.
 *
 * The pattern mirrors cron-auth.test.ts (ingest route). Both routes share
 * the same Bearer token pattern — if one regresses, both should catch it.
 * Having separate tests means a future refactor of one route can't silently
 * break the other without a red test.
 */

import { describe, test, expect, vi, beforeEach } from "vitest"

// Mock runDigests so the auth test doesn't try to hit the database.
// We only want to verify the auth layer — the actual digest logic is
// tested separately in digest-schedule.test.ts.
vi.mock("@/lib/digest", () => ({
  runDigests: vi.fn().mockResolvedValue({ sent: 0, skipped: 0 }),
}))

import { GET } from "@/app/api/cron/digest/route"

describe("GET /api/cron/digest — authentication", () => {

  const VALID_SECRET = "test-digest-cron-secret-xyz"

  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", VALID_SECRET)
    return () => vi.unstubAllEnvs()
  })

  test("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/cron/digest")
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  test("returns 401 when the token is wrong", async () => {
    const req = new Request("http://localhost/api/cron/digest", {
      headers: { Authorization: "Bearer wrong-token" },
    })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  test("returns 401 when Authorization is not Bearer format", async () => {
    const req = new Request("http://localhost/api/cron/digest", {
      headers: { Authorization: VALID_SECRET },
    })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  test("returns 401 when CRON_SECRET env var is not set", async () => {
    // Fail closed — missing env var must not grant access.
    vi.stubEnv("CRON_SECRET", "")

    const req = new Request("http://localhost/api/cron/digest", {
      headers: { Authorization: `Bearer ${VALID_SECRET}` },
    })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  test("returns 200 with a valid Bearer token", async () => {
    const req = new Request("http://localhost/api/cron/digest", {
      headers: { Authorization: `Bearer ${VALID_SECRET}` },
    })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

})
