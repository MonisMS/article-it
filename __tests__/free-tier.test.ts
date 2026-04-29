/**
 * __tests__/free-tier.test.ts
 *
 * Tests for POST /api/user/topics.
 * File: app/api/user/topics/route.ts
 *
 * Plan-based limits are currently dormant — any authenticated user can
 * follow any number of topics. These tests cover auth and input validation.
 */

import { describe, test, expect, vi, beforeEach } from "vitest"

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}))

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

function postRequest(body: unknown) {
  return new Request("http://localhost/api/user/topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function mockSession() {
  vi.mocked(auth.api.getSession).mockResolvedValue({
    user: { id: "user_123", email: "user@test.com", name: "Test User" },
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

  beforeEach(() => mockSession())

  test("returns 400 when topicIds is missing", async () => {
    const res = await POST(postRequest({}))
    expect(res.status).toBe(400)
  })

  test("returns 400 when topicIds is an empty array", async () => {
    const res = await POST(postRequest({ topicIds: [] }))
    expect(res.status).toBe(400)
  })

  test("returns 400 when topicIds is not an array", async () => {
    const res = await POST(postRequest({ topicIds: "not-an-array" }))
    expect(res.status).toBe(400)
  })

})

describe("POST /api/user/topics — authenticated user", () => {

  beforeEach(() => mockSession())

  test("allows any number of topics", async () => {
    const topicIds = Array.from({ length: 10 }, (_, i) => `topic_${i}`)
    const res = await POST(postRequest({ topicIds }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.ok).toBe(true)
  })

  test("allows a single topic", async () => {
    const res = await POST(postRequest({ topicIds: ["t1"] }))
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
    mockSession()
    const res = await GET()
    expect(res.status).toBe(200)
  })

})
