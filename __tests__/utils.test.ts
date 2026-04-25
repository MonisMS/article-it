/**
 * __tests__/utils.test.ts
 *
 * Unit tests for lib/utils.ts
 *
 * WHAT IS A UNIT TEST?
 * A unit test covers one small, self-contained piece of logic — a "unit".
 * Usually that means a single function. These run in milliseconds because
 * there is no database, no network, no browser. Just function in → value out.
 *
 * ANATOMY OF A TEST:
 *   test("description of what should happen", () => {
 *     // 1. Arrange — set up inputs
 *     // 2. Act     — call the function
 *     // 3. Assert  — check the output matches expectation
 *   })
 *
 * If the assertion fails, Vitest throws an error and marks the test red.
 * If every assertion passes, the test is green.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest"
import { slugify, timeAgo, readingTime, initials, formatDate, monthLabel } from "@/lib/utils"

// describe() groups related tests together.
// Not required, but makes the output easier to read when you have many tests.
describe("slugify", () => {

  test("lowercases the string", () => {
    expect(slugify("Machine Learning")).toBe("machine-learning")
  })

  test("replaces spaces with hyphens", () => {
    expect(slugify("web development")).toBe("web-development")
  })

  test("strips special characters", () => {
    // The admin panel uses slugify when creating topic slugs.
    // A topic like "C++ & Go!" should become "c-go" — no symbols.
    expect(slugify("C++ & Go!")).toBe("c-go")
  })

  test("collapses multiple spaces into a single hyphen", () => {
    expect(slugify("artificial   intelligence")).toBe("artificial-intelligence")
  })

  test("trims leading and trailing whitespace", () => {
    expect(slugify("  react  ")).toBe("react")
  })

  test("handles an already-clean slug unchanged", () => {
    expect(slugify("javascript")).toBe("javascript")
  })

  test("handles a single word with no special chars", () => {
    expect(slugify("TypeScript")).toBe("typescript")
  })

  // Edge cases — these are the sneaky inputs that break naive implementations.
  test("handles empty string", () => {
    expect(slugify("")).toBe("")
  })

  test("handles string that is only special characters", () => {
    // After stripping symbols and trimming, nothing should remain.
    expect(slugify("!@#$%")).toBe("")
  })

})

// ─── timeAgo ─────────────────────────────────────────────────────────────────
//
// timeAgo() calls Date.now() internally, which means it depends on the real
// clock. If we let it use the real clock, a test written at 2:00pm might fail
// at 11:00pm because the diff crosses a threshold. We fix this with fake timers:
// vi.useFakeTimers() replaces Date.now() with a controlled value for the
// duration of each test, then vi.useRealTimers() restores it.

describe("timeAgo", () => {
  const NOW = new Date("2024-06-15T10:00:00Z")

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("returns empty string for null", () => {
    expect(timeAgo(null)).toBe("")
  })

  test("returns minutes for a recent date", () => {
    const thirtyMinsAgo = new Date("2024-06-15T09:30:00Z")
    expect(timeAgo(thirtyMinsAgo)).toBe("30m ago")
  })

  test("returns hours when diff is 1–23 hours", () => {
    const twoHoursAgo = new Date("2024-06-15T08:00:00Z")
    expect(timeAgo(twoHoursAgo)).toBe("2h ago")
  })

  test("returns days when diff is 1–6 days", () => {
    const threeDaysAgo = new Date("2024-06-12T10:00:00Z")
    expect(timeAgo(threeDaysAgo)).toBe("3d ago")
  })

  test("returns weeks when diff is 7+ days", () => {
    const twoWeeksAgo = new Date("2024-06-01T10:00:00Z")
    expect(timeAgo(twoWeeksAgo)).toBe("2w ago")
  })

  test("returns 0m ago for the current moment", () => {
    expect(timeAgo(NOW)).toBe("0m ago")
  })
})

// ─── readingTime ──────────────────────────────────────────────────────────────

describe("readingTime", () => {
  test("returns empty string for null", () => {
    expect(readingTime(null)).toBe("")
  })

  test("returns empty string for empty string", () => {
    // Empty string is falsy — the guard returns early before counting words.
    expect(readingTime("")).toBe("")
  })

  test("returns 1 min read for short text (below 200 words)", () => {
    // Math.max(1, ...) ensures the minimum is always 1 minute.
    const shortText = "word ".repeat(50).trim()
    expect(readingTime(shortText)).toBe("1 min read")
  })

  test("returns 1 min read for exactly 200 words", () => {
    const text = "word ".repeat(200).trim()
    expect(readingTime(text)).toBe("1 min read")
  })

  test("returns 2 min read for 400 words", () => {
    const text = "word ".repeat(400).trim()
    expect(readingTime(text)).toBe("2 min read")
  })
})

// ─── initials ─────────────────────────────────────────────────────────────────

describe("initials", () => {
  test("returns two initials for a full name", () => {
    expect(initials("John Doe")).toBe("JD")
  })

  test("returns one initial for a single name", () => {
    expect(initials("Alice")).toBe("A")
  })

  test("caps at two characters for names with more than two words", () => {
    expect(initials("Mary Jane Watson")).toBe("MJ")
  })

  test("uppercases the initials", () => {
    expect(initials("john doe")).toBe("JD")
  })

  test("returns empty string for empty input", () => {
    expect(initials("")).toBe("")
  })
})

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
  test("returns 'Never' for null", () => {
    expect(formatDate(null)).toBe("Never")
  })

  test("returns a human-readable date string", () => {
    // Use a fixed date so the test result is the same regardless of locale clock.
    const date = new Date("2024-01-15T00:00:00Z")
    const result = formatDate(date)
    // We check that the year and month name appear — not the exact string,
    // since locale formatting can vary slightly between environments.
    expect(result).toContain("2024")
    expect(result).toContain("Jan")
  })
})

// ─── monthLabel ───────────────────────────────────────────────────────────────

describe("monthLabel", () => {
  test("returns full month name and year", () => {
    const date = new Date("2024-03-20T00:00:00Z")
    const result = monthLabel(date)
    expect(result).toContain("2024")
    expect(result).toContain("March")
  })
})
