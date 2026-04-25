/**
 * __tests__/admin.test.ts
 *
 * Tests for the isAdmin() function (lib/admin.ts).
 *
 * WHY THIS NEEDS TESTS:
 * isAdmin() is the sole gatekeeper for every /admin/* route. If it returns
 * true when it shouldn't, any user can access admin panels, create topics,
 * approve suggestions, and toggle source availability.
 *
 * Two specific scenarios are worth locking in:
 *
 * 1. Case-insensitivity — OAuth providers (Google, GitHub) sometimes return
 *    emails in different casing than what was originally registered. Without
 *    case folding, "Admin@Example.com" in the env var would fail to match
 *    "admin@example.com" from the session, locking the admin out of their
 *    own panel in production.
 *
 * 2. Missing env var — the route should fail CLOSED. If ADMIN_EMAIL is not
 *    set (e.g., a staging deploy that forgot the variable), no session should
 *    be treated as admin.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from "vitest"
import { isAdmin } from "@/lib/admin"

const ADMIN = "admin@articleit.com"

beforeEach(() => {
  vi.stubEnv("ADMIN_EMAIL", ADMIN)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("isAdmin", () => {

  test("returns true for the exact admin email", () => {
    expect(isAdmin(ADMIN)).toBe(true)
  })

  test("returns true regardless of casing in the session email", () => {
    // OAuth providers may return emails in different casing.
    // This was a real bug before the toLowerCase() fix.
    expect(isAdmin("Admin@ArticleIt.com")).toBe(true)
    expect(isAdmin("ADMIN@ARTICLEIT.COM")).toBe(true)
  })

  test("returns true regardless of casing in the ADMIN_EMAIL env var", () => {
    vi.stubEnv("ADMIN_EMAIL", "ADMIN@ARTICLEIT.COM")
    expect(isAdmin("admin@articleit.com")).toBe(true)
  })

  test("returns false for a non-admin email", () => {
    expect(isAdmin("user@example.com")).toBe(false)
  })

  test("returns false when ADMIN_EMAIL is not set", () => {
    // Fail closed — no env var means no admin access, ever.
    vi.stubEnv("ADMIN_EMAIL", "")
    expect(isAdmin(ADMIN)).toBe(false)
  })

  test("returns false for an empty email string", () => {
    expect(isAdmin("")).toBe(false)
  })

})
