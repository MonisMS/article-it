# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
ArticleIt — a personalized article aggregator. RSS feeds are ingested into Postgres every 6 hours. Users pick topics, get a personalized feed, and receive scheduled email digests via Resend.

## Commands
```bash
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm db:push          # Push Drizzle schema to Neon (no migration files)
pnpm db:studio        # Open Drizzle Studio in browser
pnpm db:generate      # Generate migration files
pnpm db:seed          # Seed topics + RSS sources into DB
```

Always use `pnpm`. Never `npm` or `yarn`.

---

## Architecture

### Data flow
```
Vercel Cron (every 6h)
  → GET /api/cron/ingest   (protected by CRON_SECRET header)
  → lib/ingestion.ts       (fetches all active RSS sources in parallel, 8s timeout per source)
  → articles table         (deduped by url column)
  → article_topics table   (tags each article with source's topics)

Vercel Cron (every 1h)
  → GET /api/cron/digest   (protected by CRON_SECRET header)
  → lib/digest.ts          (checks schedules matching current UTC hour, sends emails via Resend)
  → digest_logs table      (records history of sent digests)

User visits /dashboard
  → lib/db/queries/articles.ts  (EXISTS subquery — single round trip)
  → ArticleCard component       (first topic in array = active filter topic)
```

### Auth
Better Auth is fully wired. **No mock user** — all routes require a real session.
- Server-side session: `auth.api.getSession({ headers: await headers() })` — used in API routes and server components
- Client-side: `useSession()`, `signIn()`, `signOut()` from `@/lib/auth-client`
- Auth tables (`user`, `session`, `account`, `verification`) are defined in `lib/db/schema/auth.ts` and owned by Better Auth via the Drizzle adapter. Do not rename columns.
- The `user` table has an additional `plan` field (`"free"` | `"pro"`) declared in both the schema and `lib/auth.ts` `additionalFields`.
- Session cookie cache is 5 minutes (avoids DB hit on every page load).

### Database schema (lib/db/schema/)
Split into two files re-exported from `index.ts`:
- `auth.ts` — Better Auth tables (user, session, account, verification)
- `app.ts` — Product tables: topics, rss_sources, rss_source_topics, articles, article_topics, user_topics, bookmarks, digest_schedules, digest_logs, digest_log_articles, topic_suggestions

Key relations:
- `rss_sources` ↔ `topics` — many-to-many via `rss_source_topics`
- `articles` ↔ `topics` — many-to-many via `article_topics`
- `user` ↔ `topics` — many-to-many via `user_topics` (what the user follows)
- `digest_schedules` — one per user per topic (unique constraint on userId + topicId)
- `digest_logs` + `digest_log_articles` — history of every email sent, including which articles

### API routes
| Route | Auth | Purpose |
|-------|------|---------|
| `/api/auth/[...all]` | — | Better Auth handler |
| `/api/cron/ingest` | CRON_SECRET header | Vercel Cron trigger (GET) |
| `/api/cron/digest` | CRON_SECRET header | Vercel Cron digest trigger (GET, hourly) |
| `/api/ingest` | session | Manual ingest trigger for logged-in users (POST) |
| `/api/topics` | none | Fetch all active topics |
| `/api/user/topics` | session | GET/POST user's followed topics |
| `/api/user/schedule` | session | POST/DELETE digest schedule (upserts one per topic) |
| `/api/user/account` | session | DELETE account (cascade) |
| `/api/user/profile` | session | PATCH display name |
| `/api/bookmarks` | session | GET/POST bookmarks |

All API routes return `{ data, error }` shape.

### Ingestion (lib/ingestion.ts)
- `ingestAllSources()` — fetches all active `rss_sources`, runs in parallel via `Promise.allSettled`
- Each source is wrapped in `Promise.race` with an 8-second hard timeout
- Articles deduped by `url` via `onConflictDoNothing()`
- Timed-out/failed sources are skipped and retried on the next cron run

### Digest sending (lib/digest.ts)
- `runDigests()` — runs every hour, checks all active schedules where `hour` matches current UTC hour
- For weekly digests: converts UTC time to user's timezone to verify day-of-week match
- Gets articles since the last digest (or 7 days if never sent), caps at 10 articles
- Sends via Resend; records to `digest_logs` + `digest_log_articles`
- Unsubscribe link is HMAC-signed with `BETTER_AUTH_SECRET` (`lib/unsubscribe-token.ts`)

### Onboarding flow
`/sign-up` → Better Auth email verification → `/onboarding` (pick topics) → `/onboarding/schedule` (set digest schedule) → `/dashboard`

### Cron schedule (vercel.json)
```json
{ "path": "/api/cron/ingest",  "schedule": "0 */6 * * *" }   // every 6 hours
{ "path": "/api/cron/digest",  "schedule": "0 * * * *"   }   // every hour
```
**IMPORTANT — Vercel Hobby plan limitation:** Hobby tier only runs each cron once per day max. The hourly digest cron requires **Vercel Pro** to function as designed. See "Deployment notes" section below.

## Environment Variables
```
DATABASE_URL=           # Neon pooled connection string (use pooled, not direct)
RESEND_API_KEY=         # Resend email API key
BETTER_AUTH_SECRET=     # Min 32 chars random secret (also used as HMAC key for unsubscribe tokens)
NEXT_PUBLIC_APP_URL=    # https://yourdomain.com in prod, http://localhost:3000 in dev
CRON_SECRET=            # Arbitrary secret — sent as Bearer token by Vercel Cron
```

---

## MVP Status

### Fully implemented and working
- Email/password sign-up, sign-in, email verification, password reset
- 2-step onboarding: pick topics → set digest schedule
- RSS ingestion every 6h with parallel fetching and hard timeout
- Personalized article feed with topic filtering and pagination
- Discover page (browse all topics and articles without filtering)
- Bookmarks with optimistic UI
- Email digest scheduling (daily/weekly, time picker, timezone-aware)
- Digest email sending with HTML templates and unsubscribe
- Settings: display name, topics, multiple digest schedules, account deletion
- Landing page

### Known gaps before showing to friends
1. **Resend domain verification** — emails from `@articleit.com` won't deliver until the domain is verified in the Resend dashboard. Until verified, use Resend's sandbox domain or a verified personal domain.
2. **Vercel cron plan** — hourly digest requires Pro plan. On Hobby, ingest still works (once/day cap). Decide before deploy.
3. **Seed data** — run `pnpm db:seed` after first deploy to populate topics and RSS sources. No articles exist in a fresh DB.
4. **"Upgrade to Pro" button** in settings goes nowhere — no payment/upgrade flow exists yet.
5. **OAuth (Google/GitHub sign-in)** — table schema exists but no OAuth logic is wired.
6. **Topic suggestions** (pro feature) — schema exists, no UI or approval flow.
7. **No admin panel** — can't add/remove RSS sources or topics from the UI; must edit seed data and re-run.
8. **No search** — no full-text search on articles.

---

## Deployment notes

### Critical: Vercel plan requirement
**Both cron schedules will cause the Vercel build to fail on the Hobby plan.** Vercel validates cron expressions at deploy time and rejects builds where any cron runs more than once per day. `0 */6 * * *` (4×/day) and `0 * * * *` (24×/day) both require **Vercel Pro ($20/mo)**. This is not a soft runtime limit — the deployment itself errors out.

If you want to test on Hobby temporarily: change both schedules in `vercel.json` to `0 0 * * *` (once daily), knowing that digests and ingestion will only run at midnight UTC.

### Pre-deploy checklist
1. Confirm **Vercel Pro** plan is active
2. Set all five env vars in Vercel dashboard → Settings → Environment Variables:
   - `DATABASE_URL` — Neon **pooled** connection string (hostname ends in `-pooler`)
   - `RESEND_API_KEY` — Resend API key
   - `BETTER_AUTH_SECRET` — `openssl rand -hex 32`. **Never rotate this in prod** without a plan — it invalidates all sessions and HMAC unsubscribe tokens simultaneously.
   - `NEXT_PUBLIC_APP_URL` — exact production URL, e.g. `https://articleit.vercel.app`. No trailing slash. Used as Better Auth's `baseURL` for all email callback links. Wrong value = broken email verification.
   - `CRON_SECRET` — `openssl rand -hex 32`. Production only (crons don't fire on preview branches).
3. Run `pnpm build` locally first — if it fails locally it fails on Vercel
4. Run `pnpm db:push` against production DB using the **direct** (non-pooler) Neon connection string — PgBouncer's transaction-mode pooler breaks migration prepared statements
5. Run `pnpm db:seed` to populate topics and RSS sources (empty DB = empty feeds)
6. Verify sending domain (`articleit.com`) in Resend dashboard — unverified domain = silent delivery failure

### Post-deploy verification
- Hit `/api/cron/ingest` in browser → should return `401 Unauthorized` (confirms fail-closed guard works)
- Vercel dashboard → Settings → Cron Jobs → verify both jobs are listed and enabled
- Manually trigger ingest once from Vercel dashboard to confirm end-to-end
- Sign up with a test account → check the verification email link points to your production domain (not localhost)

### Cron: how Vercel triggers them
Vercel makes an HTTP GET request from its own infrastructure at the scheduled time. It attaches `Authorization: Bearer <CRON_SECRET>` automatically when `CRON_SECRET` is set in the dashboard. The function runs like any serverless function — **no automatic retry on failure**. Watch Runtime Logs after each scheduled fire.

Crons only fire on **production deployments**, not preview branches.

### Neon connection strings
- **Pooled** (`-pooler` in hostname): use for `DATABASE_URL` in production and local `.env`. PgBouncer keeps warm connections, faster cold starts.
- **Direct** (no `-pooler`): use only for schema migrations (`pnpm db:push`, `pnpm db:generate`). Drizzle's migration runner uses prepared statements that PgBouncer's transaction-mode pooler doesn't support.
- The app uses `@neondatabase/serverless` HTTP driver — no TCP sockets, works in all runtimes.

### Better Auth and Edge Runtime
Better Auth requires Node.js `crypto`. Never import `lib/auth.ts` in Edge routes or `middleware.ts`. If you add a `middleware.ts` later, use `getSessionCookie()` (lightweight cookie read, no DB) for routing decisions only — validate the full session in the actual page/API route.

---

## Working with Claude Code — Best Practices

These practices apply to all AI-assisted development in this repo.

### 1. Deploy subagents for parallel work
When a task has independent parts (e.g., "explore the codebase AND research the Vercel docs"), launch multiple agents in parallel rather than doing both sequentially in one context. Use `subagent_type: "Explore"` for codebase exploration so the main context window isn't polluted with raw file contents. Examples:
- One agent reads all files → returns a structured summary
- Another agent does web research → returns deployment guide
- Main agent synthesizes and writes the code

This keeps the main context focused on decisions and output, not on raw data gathering.

### 2. Context window design — keep it clean
The context window fills up with tool results. Design prompts to subagents so they return **summaries, not raw dumps**. When exploring large files, ask for "the key decisions and patterns, not the full code". Defer reading files until you need them; don't speculatively read everything.

### 3. Read before editing
Always read the file (or the relevant section) before making an edit. Never edit based on assumptions about what a file contains. This repo has non-obvious patterns (e.g., Drizzle schema split across two files, Better Auth error shapes).

### 4. Prefer editing over creating
Edit existing files rather than creating new ones. Only create a file if no existing file is the right home for the code.

### 5. Schema changes — always db:push
After any change to `lib/db/schema/*.ts`, run `pnpm db:push` to sync the schema to Neon. Migration files are not used (`db:push` only).

### 6. Don't mock auth
No mock users, no session bypasses. All protected routes require a real session from Better Auth. Test with a real account.

### 7. API route shape
All API routes must return `{ data, error }`. Never return raw data or throw unhandled errors. Pattern:
```ts
try {
  return NextResponse.json({ data: result, error: null })
} catch (e) {
  return NextResponse.json({ data: null, error: "message" }, { status: 500 })
}
```

### 8. cuid2 for IDs
All new table IDs use `cuid2`. Don't use `uuid()` or auto-increment. Pattern: `id: text("id").primaryKey().$defaultFn(() => createId())`.

### 9. Timezone handling
Digest schedules store `hour` in UTC. When checking day-of-week for weekly digests, convert UTC to user's `timezone` field (IANA tz string). Never assume UTC == user's local time.

### 10. Validate API inputs with Zod
Any user-supplied input to an API route must be validated with Zod before touching the DB. Schema lives inline in the route file unless it's reused.
