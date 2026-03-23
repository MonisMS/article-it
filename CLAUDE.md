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

## Architecture

### Data flow
```
Vercel Cron (every 6h)
  → GET /api/cron/ingest   (protected by CRON_SECRET header)
  → lib/ingestion.ts       (fetches all active RSS sources in parallel, 8s timeout per source)
  → articles table         (deduped by url column)
  → article_topics table   (tags each article with source's topics)

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

### Database schema (lib/db/schema/)
Split into two files re-exported from `index.ts`:
- `auth.ts` — Better Auth tables (user, session, account, verification)
- `app.ts` — Product tables: topics, rss_sources, rss_source_topics, articles, article_topics, user_topics, bookmarks, digest_schedules, digest_logs, digest_log_articles

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
| `/api/ingest` | session | Manual ingest trigger for logged-in users (POST) |
| `/api/topics` | none | Fetch all active topics |
| `/api/user/topics` | session | GET/POST user's followed topics |
| `/api/user/schedule` | session | POST digest schedule (upserts one per topic) |

All API routes return `{ data, error }` shape.

### Ingestion (lib/ingestion.ts)
- `ingestAllSources()` — fetches all active `rss_sources`, runs in parallel via `Promise.allSettled`
- Each source is wrapped in `Promise.race` with an 8-second hard timeout
- Articles deduped by `url` via `onConflictDoNothing()`
- Timed-out/failed sources are skipped and retried on the next cron run

### Onboarding flow
`/sign-up` → Better Auth → `/onboarding` (pick topics) → `/onboarding/schedule` (set digest schedule) → `/dashboard`

### Cron schedule
Defined in `vercel.json`. Currently only ingest (`0 */6 * * *`). Digest sending cron (`/api/cron/digest`) is not yet built.

## Environment Variables
```
DATABASE_URL=           # Neon connection string (pooled)
RESEND_API_KEY=         # Resend email API key
BETTER_AUTH_SECRET=     # Min 32 chars random secret
NEXT_PUBLIC_APP_URL=    # http://localhost:3000 in dev
CRON_SECRET=            # Arbitrary secret — sent as Bearer token by Vercel Cron
```
