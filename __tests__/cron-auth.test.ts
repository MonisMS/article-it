/**
 * __tests__/cron-auth.test.ts
 *
 * Tests for the cron route's authentication check.
 * File: app/api/cron/ingest/route.ts
 *
 * WHAT IS A MOCK?
 * The cron route does two things: (1) checks auth, (2) runs ingestion.
 * We only want to test auth here, so we "mock" the ingestion function —
 * we replace the real implementation with a fake one that does nothing.
 *
 * This is the most important testing concept to understand:
 *   Real code  → talks to the DB, fetches RSS, takes seconds
 *   Mock code  → returns a fake result instantly, no side effects
 *
 * vi.mock() intercepts the import before the module loads. Any file that
 * imports "@/lib/ingestion" during these tests gets the fake version instead.
 *
 * WHY TEST AUTH?
 * The cron endpoints fetch and store data. If auth fails open (i.e., accepts
 * requests without a token), anyone on the internet can trigger your ingestion
 * pipeline or spam your DB. This test is a safety net against that regression.
 */

import { describe, test, expect, vi, beforeEach } from "vitest"

// vi.mock() must be called BEFORE the import of the module under test.
// Vitest hoists it to the top automatically, but it's good practice to
// write it first so the intent is clear.
vi.mock("@/lib/ingestion", () => ({
  // Replace ingestAllSources with a no-op that returns immediately.
  // The auth check runs before this is ever called, so the fake doesn't
  // need to do anything meaningful.
  ingestAllSources: vi.fn().mockResolvedValue({ fetched: 0, skipped: 0 }),
}))

// Import the route handler AFTER the mock is declared.
// The handler is just an async function — we can call it directly in tests
// by passing a fake Request object.
import { GET } from "@/app/api/cron/ingest/route"

describe("GET /api/cron/ingest — authentication", () => {

  const VALID_SECRET = "test-cron-secret-abc123"

  // beforeEach() runs before every individual test in this describe block.
  // Here we use it to set the CRON_SECRET environment variable to a known
  // value, and restore the original environment after each test.
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", VALID_SECRET)
    return () => vi.unstubAllEnvs()
  })

  test("returns 401 when Authorization header is missing", async () => {
    // A plain Request with no headers at all — simulates an anonymous caller.
    const req = new Request("http://localhost/api/cron/ingest")

    const res = await GET(req)

    // The route should reject immediately with 401 Unauthorized.
    expect(res.status).toBe(401)

    const body = await res.json()
    expect(body.error).toBe("Unauthorized")
  })

  test("returns 401 when the token is wrong", async () => {
    const req = new Request("http://localhost/api/cron/ingest", {
      headers: { Authorization: "Bearer wrong-token" },
    })

    const res = await GET(req)

    expect(res.status).toBe(401)
  })

  test("returns 401 when Authorization is not Bearer format", async () => {
    // Some callers might pass the token without the "Bearer " prefix.
    const req = new Request("http://localhost/api/cron/ingest", {
      headers: { Authorization: VALID_SECRET },
    })

    const res = await GET(req)

    expect(res.status).toBe(401)
  })

  test("returns 401 when CRON_SECRET env var is not set", async () => {
    // The route must fail CLOSED when the secret is missing from the
    // environment — it should not grant access just because auth is unconfigured.
    vi.stubEnv("CRON_SECRET", "")

    const req = new Request("http://localhost/api/cron/ingest", {
      headers: { Authorization: `Bearer ${VALID_SECRET}` },
    })

    const res = await GET(req)

    expect(res.status).toBe(401)
  })

  test("returns 200 with a valid Bearer token", async () => {
    // The happy path — correct token, ingestAllSources (mocked) runs and returns.
    const req = new Request("http://localhost/api/cron/ingest", {
      headers: { Authorization: `Bearer ${VALID_SECRET}` },
    })

    const res = await GET(req)

    // Ingestion succeeded (mocked) → route returns ok: true
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

})
