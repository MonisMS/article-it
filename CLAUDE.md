# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
ArticleIt — a personalized article aggregator. RSS feeds are ingested into Postgres every 6 hours. Users pick topics, get a personalized feed, and receive scheduled email digests via Resend.

## Commands
```bash
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm db:push          # Push Drizzle schema to Neon — use the DIRECT connection string, not pooled
pnpm db:studio        # Open Drizzle Studio in browser
pnpm db:seed          # Seed 12 topics + 47 RSS sources into DB
```

Always use `pnpm`. Never `npm` or `yarn`. There are no automated tests.

To manually test cron logic locally:
```bash
curl -X GET http://localhost:3000/api/cron/ingest \
  -H "Authorization: Bearer <CRON_SECRET from .env.local>"
```

---

## Architecture

### Route groups
All authenticated app pages live under `app/(app)/` — a shared layout that handles auth + renders the sidebar (desktop) + mobile bottom nav. The route group does not affect URLs.

```
app/
  (app)/          ← shared auth layout, sidebar, mobile nav
    dashboard/    → /dashboard
    discover/     → /discover
    bookmarks/    → /bookmarks
    settings/     → /settings
  (auth)/         ← public auth pages (sign-in, sign-up, etc.)
  api/            ← API routes
  page.tsx        ← landing page
```

### Data flow
```
GitHub Actions (every 6h)
  → GET /api/cron/ingest   (Authorization: Bearer CRON_SECRET)
  → lib/ingestion.ts       (parallel RSS fetch, 8s timeout per source)
  → articles table         (deduped by url — onConflictDoNothing)
  → article_topics table

GitHub Actions (every 1h)
  → GET /api/cron/digest   (Authorization: Bearer CRON_SECRET)
  → lib/digest.ts          (finds schedules matching current UTC hour)
  → Resend email           (HTML template + HMAC-signed unsubscribe link)
  → digest_logs table

User visits /dashboard
  → getArticlesForUser()   (EXISTS subquery, single DB round trip)
  → ArticleCard            (shows imageUrl if present, read/bookmark state)
```

**Note:** `vercel.json` is intentionally empty (`{}`). Crons run via GitHub Actions workflows in `.github/workflows/` because Vercel Hobby plan rejects deploys with sub-daily cron schedules. After deploying, set `APP_URL` and `CRON_SECRET` as GitHub Actions secrets.

### Auth
Better Auth with Drizzle adapter. **No mock users** — all protected routes require a real session.
- Server-side: `auth.api.getSession({ headers: await headers() })`
- Client-side: `useSession()`, `signIn()`, `signOut()` from `@/lib/auth-client`
- Auth tables are in `lib/db/schema/auth.ts` — **do not rename columns**, Better Auth owns them
- `user` table has an extra `plan` field (`"free"` | `"pro"`) declared in both the schema and `lib/auth.ts` `additionalFields`
- Session cookie is cached for 5 minutes to avoid a DB hit on every page load
- **Never import `lib/auth.ts` in Edge routes or `middleware.ts`** — Better Auth requires Node.js `crypto`

### Database (lib/db/schema/)
Two files, both re-exported from `index.ts`:
- `auth.ts` — Better Auth tables: user, session, account, verification
- `app.ts` — Product tables: topics, rss_sources, rss_source_topics, articles, article_topics, user_topics, bookmarks, read_articles, digest_schedules, digest_logs, digest_log_articles, topic_suggestions

Key relations:
- `rss_sources` ↔ `topics` — many-to-many via `rss_source_topics`
- `articles` ↔ `topics` — many-to-many via `article_topics`
- `user` ↔ `topics` — many-to-many via `user_topics`
- `digest_schedules` — unique on (userId, topicId)
- `read_articles` — unique on (userId, articleId); tracks which articles a user has marked read
- `bookmarks` — unique on (userId, articleId)

After any schema change, run `pnpm db:push` (with the **direct** Neon connection string — PgBouncer breaks Drizzle's migration prepared statements).

### API routes
| Route | Auth | Purpose |
|---|---|---|
| `/api/auth/[...all]` | — | Better Auth handler |
| `/api/cron/ingest` | CRON_SECRET | RSS ingestion (GET) |
| `/api/cron/digest` | CRON_SECRET | Digest sending (GET) |
| `/api/ingest` | session | Manual ingest trigger (POST) |
| `/api/topics` | none | All active topics (GET) |
| `/api/user/topics` | session | Followed topics (GET/POST) |
| `/api/user/schedule` | session | Digest schedule (POST/DELETE) |
| `/api/user/read` | session | Mark article read/unread (POST, toggles) |
| `/api/user/account` | session | Delete account (DELETE) |
| `/api/user/profile` | session | Update display name (PATCH) |
| `/api/bookmarks` | session | Bookmarks (GET/POST) |

All routes return `{ data, error }`. All user input is validated with Zod inline in the route file.

### Neon DB connection (lib/db/index.ts)
Uses `@neondatabase/serverless` HTTP driver (no TCP sockets — works in all runtimes). The client wraps native `fetch` with a retry function (`fetchWithRetry`) that handles two failure modes:
1. **Node v20 Happy Eyeballs bug** — WSL2 + dual-stack DNS causes `AggregateError` after 250ms. Mitigated by `NODE_OPTIONS=--no-network-family-autoselection` in `.env.local`.
2. **Neon cold start** — free-tier compute suspends after 5 min idle; first query fails. Retried with 100ms → 300ms → 700ms backoff.

### Cron security
Both cron routes fail closed: `if (!cronSecret || authHeader !== \`Bearer ${cronSecret}\`)`. If `CRON_SECRET` env var is missing the endpoint returns 401, it does not fall open.

Both cron routes also export `maxDuration = 300` (requires Vercel Pro; ignored on Hobby).

### Digest timezone logic
Schedules store `hour` in UTC. For weekly digests, `lib/digest.ts` converts the current UTC time to the user's `timezone` (IANA string) to check the day-of-week match. Never assume UTC == local time.

### Onboarding flow
`/sign-up` → email verification → `/onboarding` (pick ≥1 topic) → `/onboarding/schedule` (set digest schedule) → `/dashboard`

---

## Environment Variables
```
DATABASE_URL=           # Neon pooled connection string for runtime; use direct string for db:push
RESEND_API_KEY=         # Resend API key; emails send from noreply@m0nis.com / digest@m0nis.com
BETTER_AUTH_SECRET=     # ≥32 char secret; also used as HMAC key for unsubscribe tokens — never rotate without a plan
NEXT_PUBLIC_APP_URL=    # Exact origin, no trailing slash (http://localhost:3000 in dev)
CRON_SECRET=            # Bearer token checked by /api/cron/* routes
NODE_OPTIONS=--no-network-family-autoselection   # WSL2 fix for Node v20 fetch AggregateError
```

---

## Conventions

**IDs** — all table primary keys use `cuid2`: `id: text("id").primaryKey().$defaultFn(() => createId())`

**API shape** — always `{ data, error }`:
```ts
try {
  return NextResponse.json({ data: result, error: null })
} catch (e) {
  return NextResponse.json({ data: null, error: "message" }, { status: 500 })
}
```

**Account deletion** — delete `session` and `account` rows explicitly before deleting `user`, to avoid FK violations when DB-level cascade constraints aren't in sync with the Drizzle schema definition.

**Subagents for parallel work** — when a task has independent parts (explore codebase + research docs), launch multiple agents in parallel. Use `subagent_type: "Explore"` for codebase reading to keep the main context clean. Have subagents return structured summaries, not raw file dumps.
