/**
 * __tests__/free-tier.test.ts
 *
 * Tests for the free-plan topic limit on POST /api/user/topics.
 * File: app/api/user/topics/route.ts
 *
 * WHY THIS NEEDS TESTS:
 * The 5-topic limit is a business rule — free users can't follow more than 5
 * topics. If this check is accidentally removed or bypassed, free users get
 * pro-level features for free, which directly undermines the revenue model.
 *
 * WHAT WE'RE TESTING:
 * We're not testing the database operations themselves (that would require a
 * real DB). We're testing the DECISION LOGIC:
 *   - Does the route correctly read the plan from the session?
 *   - Does it enforce the 5-topic limit for free users?
 *   - Does it allow pro users through with any number of topics?
 *   - Does it reject unauthenticated requests?
 *   - Does it validate the request body?
 *
 * MOCK STRATEGY:
 * The route imports auth (needs a session), db (needs query/mutation stubs),
 * and next/headers (needs a request context). We mock all three so the route
 * handler runs in isolation — no database, no real HTTP stack.
 */

import { describe, test, expect, vi, beforeEach } from "vitest"

// All mocks must be declared BEFORE importing the module under test.
// Vitest hoists vi.mock() calls, but writing them at the top makes the
// intent clear and prevents ordering surprises.

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}))

// The DB mock needs to support the chained pattern used in the route:
//   db.delete(table).where(condition)
//   db.insert(table).values(rows)
// Each call returns an object with the next method in the chain.
vi.mock("@/lib/db", () => ({
  db: {
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    query: {
      userTopics: { findMany: vi.fn().mockResolvedValue([]) },
    },
  },
}))

import { POST, GET } from "@/app/api/user/topics/route"
import { auth } from "@/lib/auth"

// Helper — builds a POST request with a JSON body
function postRequest(body: unknown) {
  return new Request("http://localhost/api/user/topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

// Helper — creates a mock session with the given plan
function mockSession(plan: "free" | "pro") {
  vi.mocked(auth.api.getSession).mockResolvedValue({
    user: { id: "user_123", email: "user@test.com", name: "Test User", plan },
    session: { id: "session_abc" },
  } as never)
}

describe("POST /api/user/topics — authentication", () => {

  test("returns 401 when there is no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never)

    const res = await POST(postRequest({ topicIds: ["t1"] }))

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe("Unauthorized")
  })

})

describe("POST /api/user/topics — input validation", () => {

  beforeEach(() => mockSession("free"))

  test("returns 400 when topicIds is missing", async () => {
    const res = await POST(postRequest({}))
    expect(res.status).toBe(400)
  })

  test("returns 400 when topicIds is an empty array", async () => {
    // The schema requires at least one topic — empty means nothing to follow.
    const res = await POST(postRequest({ topicIds: [] }))
    expect(res.status).toBe(400)
  })

  test("returns 400 when topicIds is not an array", async () => {
    const res = await POST(postRequest({ topicIds: "not-an-array" }))
    expect(res.status).toBe(400)
  })

})

describe("POST /api/user/topics — free tier limit", () => {

  beforeEach(() => mockSession("free"))

  test("allows a free user to follow exactly 5 topics", async () => {
    const res = await POST(postRequest({ topicIds: ["t1", "t2", "t3", "t4", "t5"] }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.ok).toBe(true)
  })

  test("blocks a free user from following 6 topics", async () => {
    // This is the core business rule. Six topics must be rejected with 403.
    const res = await POST(postRequest({ topicIds: ["t1", "t2", "t3", "t4", "t5", "t6"] }))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toContain("5 topics")
  })

  test("returns the upgrade message in the error body", async () => {
    const res = await POST(postRequest({ topicIds: Array.from({ length: 6 }, (_, i) => `t${i}`) }))
    const body = await res.json()
    // The frontend reads this to show the upgrade prompt — it must mention Pro.
    expect(body.error).toMatch(/upgrade/i)
  })

})

describe("POST /api/user/topics — pro plan", () => {

  beforeEach(() => mockSession("pro"))

  test("allows a pro user to follow more than 5 topics", async () => {
    const topicIds = Array.from({ length: 10 }, (_, i) => `topic_${i}`)
    const res = await POST(postRequest({ topicIds }))
    expect(res.status).toBe(200)
  })

  test("allows a pro user to follow exactly 5 topics", async () => {
    const res = await POST(postRequest({ topicIds: ["t1", "t2", "t3", "t4", "t5"] }))
    expect(res.status).toBe(200)
  })

})

describe("GET /api/user/topics — authentication", () => {

  test("returns 401 when there is no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never)

    const res = await GET()
    expect(res.status).toBe(401)
  })

  test("returns 200 with an authenticated session", async () => {
    mockSession("free")
    const res = await GET()
    expect(res.status).toBe(200)
  })

})
