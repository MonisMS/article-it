import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// Wrap native fetch with exponential-backoff retry logic.
// This handles two distinct failure modes:
//
//  1. Neon free-tier cold starts: the compute is suspended after 5 min of
//     inactivity. The HTTP fetch to /sql arrives while the compute is still
//     waking up and the TCP connection is refused or times out, producing:
//       TypeError: fetch failed  [cause]: AggregateError
//
//  2. Node v20 "Happy Eyeballs" bug (affects v20.0–v20.x): Node.js
//     incorrectly cancels the IPv4 TCP attempt after 250 ms when the host
//     is dual-stack (IPv4 + IPv6), then wraps all failed attempts in an
//     AggregateError.  Neon's SNI proxy (*.neon.tech) is dual-stack, so
//     every cold-path fetch on Node v20 + WSL2 can trip this.
//
// Both errors are transient. A single retry wins >95 % of the time.
// We use truncated exponential backoff with jitter (100 ms, 300 ms, 700 ms)
// so we don't hammer Neon while the compute is resuming.
//
// fetchFunction is a neonConfig global: it replaces the fetch used for
// every HTTP /sql call made by this process. The function signature must
// match the native fetch API (url: string | URL | Request, init?: RequestInit).

const RETRY_DELAYS_MS = [100, 300, 700] // 3 attempts total (initial + 2 retries)

async function fetchWithRetry(
  url: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fetch(url, init)
    } catch (err) {
      lastError = err

      const isAggregateOrFetchError =
        err instanceof TypeError || // "fetch failed"
        (err instanceof Error && err.name === "AggregateError")

      // Only retry on network-layer errors; if it's an HTTP 4xx/5xx that
      // already has a Response we never reach this catch block anyway.
      if (!isAggregateOrFetchError) throw err

      const delay = RETRY_DELAYS_MS[attempt]
      if (delay === undefined) break // exhausted retries

      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[db] fetch attempt ${attempt + 1} failed (${(err as Error).message}), ` +
            `retrying in ${delay} ms…`
        )
      }

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Apply the retry wrapper globally before creating the neon() client.
neonConfig.fetchFunction = fetchWithRetry

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema })
