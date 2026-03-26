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

import { describe, test, expect } from "vitest"
import { slugify } from "@/lib/utils"

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
