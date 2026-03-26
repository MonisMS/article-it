/**
 * __tests__/digest-schedule.test.ts
 *
 * Unit tests for the isScheduleDue() function in lib/digest.ts
 *
 * WHY THIS FUNCTION IS WORTH TESTING:
 * The digest cron job runs every hour. For each schedule it asks:
 * "Is this due right now?" The timezone logic is the most likely
 * place for a silent bug — one where the code runs fine but sends
 * emails on the wrong day. A user in Los Angeles who picked "Monday
 * at 9am" expects a Monday email in Pacific time, not UTC.
 *
 * Because isScheduleDue() is a pure function (no DB, no network),
 * we can test every edge case by just passing in a known Date object.
 * No mocking required.
 *
 * WHAT IS A PURE FUNCTION?
 * A function that:
 *   1. Given the same inputs, always returns the same output.
 *   2. Has no side effects (doesn't write to DB, log, etc.)
 *
 * Pure functions are easy to test. This is WHY we extracted isScheduleDue()
 * out of runDigests() — so we could test the logic without needing a database.
 */

import { describe, test, expect, vi } from "vitest"

// WHY THESE MOCKS?
//
// isScheduleDue() is a pure function — no database, no network.
// But when Vitest imports lib/digest.ts, that file also imports lib/db,
// lib/resend, etc. at the TOP of the file (module level). Those imports
// call neon() and new Resend() immediately, which fail without env vars.
//
// vi.mock() intercepts the import and replaces it with a dummy object
// BEFORE the module code runs. The pure function we're testing is unaffected
// because it never calls any of these — we're just silencing noisy imports.
vi.mock("@/lib/db", () => ({ db: {} }))
vi.mock("@/lib/resend", () => ({ resend: {} }))
vi.mock("@/lib/unsubscribe-token", () => ({ signUnsubscribeToken: vi.fn() }))
vi.mock("@/lib/email/digest-template", () => ({ buildDigestEmail: vi.fn() }))

import { isScheduleDue } from "@/lib/digest"

// ─── Known reference dates ───────────────────────────────────────────────────
//
// We use fixed dates so tests are deterministic — they produce the same result
// regardless of when you run them. If you used `new Date()` instead, a test
// that passes today might fail next Tuesday.
//
// 2024-01-08 is a Monday. We'll use this as our anchor.
// In JavaScript: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

const MONDAY_UTC_NOON = new Date("2024-01-08T12:00:00Z")   // Monday, 12:00 UTC  = Monday 21:00 JST
const MONDAY_UTC_16H  = new Date("2024-01-08T16:00:00Z")   // Monday, 16:00 UTC  = Tuesday 01:00 JST
const SUNDAY_UTC_NOON = new Date("2024-01-07T12:00:00Z")   // Sunday,  12:00 UTC
const MONDAY_UTC_1AM  = new Date("2024-01-08T01:00:00Z")   // Monday,  01:00 UTC

describe("isScheduleDue — daily frequency", () => {

  test("daily schedule is always due, regardless of day", () => {
    // Daily means every single day. Day-of-week and timezone are irrelevant.
    expect(isScheduleDue("daily", null, "UTC", MONDAY_UTC_NOON)).toBe(true)
    expect(isScheduleDue("daily", null, "UTC", SUNDAY_UTC_NOON)).toBe(true)
  })

})

describe("isScheduleDue — weekly frequency, UTC timezone", () => {

  test("returns true when the local day matches the scheduled day", () => {
    // dayOfWeek=1 means Monday. The date IS a Monday in UTC → should fire.
    expect(isScheduleDue("weekly", 1, "UTC", MONDAY_UTC_NOON)).toBe(true)
  })

  test("returns false when the local day does not match", () => {
    // dayOfWeek=1 (Monday) but the date is a Sunday → should NOT fire.
    expect(isScheduleDue("weekly", 1, "UTC", SUNDAY_UTC_NOON)).toBe(false)
  })

  test("returns true for Sunday (dayOfWeek=0) on a Sunday", () => {
    expect(isScheduleDue("weekly", 0, "UTC", SUNDAY_UTC_NOON)).toBe(true)
  })

})

describe("isScheduleDue — weekly frequency, timezone conversion", () => {
  //
  // This is the REAL reason this function needs tests.
  //
  // Scenario: A user in Los Angeles (America/Los_Angeles, UTC-8 in winter)
  // picks "Monday at 9am local time". The digest cron saves their schedule
  // as hour=17 (9am + 8h = 17:00 UTC).
  //
  // When the cron runs at 01:00 UTC on a Monday (still Sunday in LA),
  // isScheduleDue should return FALSE — the user's local day is still Sunday.
  //
  // Without this test, a developer might "fix" the timezone logic and
  // accidentally send Monday emails on Sunday for US users.
  //

  test("Monday 1am UTC is still Sunday in Los Angeles (UTC-8)", () => {
    // dayOfWeek=1 = Monday, but in LA it's Sunday at 01:00 UTC → should NOT fire
    expect(
      isScheduleDue("weekly", 1, "America/Los_Angeles", MONDAY_UTC_1AM)
    ).toBe(false)
  })

  test("Monday 1am UTC is already Monday in London (UTC+0)", () => {
    // In UTC itself, 01:00 Monday is still Monday → should fire
    expect(
      isScheduleDue("weekly", 1, "Europe/London", MONDAY_UTC_1AM)
    ).toBe(true)
  })

  test("Monday 16:00 UTC is already Tuesday in Tokyo (UTC+9)", () => {
    // Tokyo is 9h ahead — Monday 16:00 UTC = Tuesday 01:00 JST.
    // Tuesday starts in Tokyo at 15:00 UTC on Monday.
    // dayOfWeek=1 (Monday) should NOT fire because Tokyo is already Tuesday.
    expect(
      isScheduleDue("weekly", 1, "Asia/Tokyo", MONDAY_UTC_16H)
    ).toBe(false)
  })

  test("Monday noon UTC is still Monday in New York (UTC-5)", () => {
    // New York is 5h behind — Monday 12:00 UTC = Monday 07:00 EST → correct day
    expect(
      isScheduleDue("weekly", 1, "America/New_York", MONDAY_UTC_NOON)
    ).toBe(true)
  })

})

describe("isScheduleDue — unknown frequency", () => {

  test("returns false for an unrecognised frequency string", () => {
    // Defensive: if a bad value ever ends up in the DB, don't send the digest.
    expect(isScheduleDue("monthly", 1, "UTC", MONDAY_UTC_NOON)).toBe(false)
  })

})
