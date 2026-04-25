# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git
- **Never add `Co-Authored-By: Claude` to commit messages.** Commits are authored by the user only.

## What This Is
ArticleIt (branded "Curio") — a personalized article aggregator. RSS feeds are ingested into Postgres daily. Users pick topics, get a personalized feed ranked by source quality, and receive scheduled email digests via Resend.

---

## Commands
```bash
pnpm dev              # Dev server (localhost:3000)
pnpm dev:clean        # Clears .next cache then starts dev server
pnpm build            # Production build
pnpm lint             # ESLint
pnpm test             # Run all tests once (use before deploying)
pnpm test:watch       # Re-run tests on file save (use during development)
pnpm db:push          # Push Drizzle schema to Neon — use the DIRECT connection string, not pooled
pnpm db:generate      # Generate Drizzle migration files
pnpm db:studio        # Open Drizzle Studio in browser
pnpm db:seed          # Seed 26 topics + 275 RSS sources into DB (idempotent — safe to re-run)
```

Always use `pnpm`. Never `npm` or `yarn`.

To manually trigger cron logic locally (dev server must be running):
```bash
# Copy CRON_SECRET from .env.local and paste it directly — grep won't work if value has quotes:
curl -X GET http://localhost:3000/api/cron/ingest \
  -H "Authorization: Bearer <CRON_SECRET>"
```

---

## Architecture

### Route groups
```
app/
  (app)/            ← auth-gated shared layout (sidebar + mobile nav)
    dashboard/      → /dashboard
    discover/       → /discover  (topic grid + ?topic= detail view for auth users)
    bookmarks/      → /bookmarks
    history/        → /history
    profile/        → /profile  (settings hub — tabs: overview, topics, digests, account)
    settings/       → /settings (redirects to /profile)
    suggest/        → /suggest
    upgrade/        → /upgrade
    admin/          → /admin/* (ADMIN_EMAIL session check — 404 for everyone else)
  (auth)/           ← public auth pages (sign-in, sign-up, verify-email, forgot/reset password)
  topics/[slug]/    ← PUBLIC topic pages (SSG, no auth — SEO-indexed)
  pocket-alternative/
  feedly-alternative/
  mailbrew-alternative/
  readwise-alternative/
  inoreader-alternative/
  personalized-email-digest/
  rss-reader-email/
  stay-informed/    ← 8 SEO landing pages (static, no auth)
  feedback/         ← public HMAC-gated article feedback (thumbs up/down from digest email)
  p/[username]/     ← PUBLIC shareable reading profile (SSR, no auth — 404 if publicProfile=false)
  api/              ← API routes
  page.tsx          ← landing page (JSON-LD WebApplication + FAQPage structured data)
  robots.ts         ← blocks auth/admin/api from indexing
  sitemap.ts        ← homepage + SEO pages (0.9) + all topic pages (0.8)
```

### Data flow
```
GitHub Actions (daily 06:00 UTC)
  → GET /api/cron/ingest      parallel RSS fetch, 8s timeout per source
  → lib/ingestion.ts          dedupes by URL (onConflictDoNothing)
  → articles + article_topics tables

GitHub Actions (hourly 06:00–22:00 UTC)
  → GET /api/cron/digest      finds schedules matching current UTC hour
  → lib/digest.ts             pre-generates logId before email send (needed for feedback URLs)
  → Resend email              HMAC-signed feedback URLs (👍/👎) per article
  → digest_logs + digest_log_articles tables

GitHub Actions (Sunday 04:00 UTC)
  → GET /api/cron/quality     sources with ≥5 interactions get new qualityScore
  → formula: bookmarks × 0.6 + reads × 0.4, capped at 1.0

GitHub Actions (Sunday 03:00 UTC)
  → GET /api/cron/cleanup     deletes articles >90 days old with no bookmarks

GitHub Actions (Monday 10:00 UTC)
  → GET /api/cron/reengage    users lapsed 21+ days, skips if emailed in last 30 days
  → lib/email/reengage-template.ts  per-topic new article counts since last read

User visits /dashboard
  → POST /api/user/visit      stamps user.lastVisitAt = now (for "new since last visit" banner)
  → getArticlesForUser()      quality-blended ranking: publishedAt + (qualityScore × 12h)
  → getDailyQueue()           top 5 unread articles (same ranking)
  → getReadingStreak()        streak + 7-day bar chart data
  → getNewArticlesCount()     articles since lastVisitAt across followed topics
```

**Note:** `vercel.json` is intentionally empty (`{}`). Crons run via GitHub Actions because Vercel Hobby rejects sub-daily cron schedules. Set `APP_URL` and `CRON_SECRET` as GitHub Actions secrets after deploying.

### Auth
Better Auth with Drizzle adapter. **No mock users** — all protected routes require a real session.
- Server-side: `auth.api.getSession({ headers: await headers() })`
- Client-side: `useSession()`, `signIn()`, `signOut()` from `@/lib/auth-client`
- Google + GitHub OAuth: `signInWithGoogle()` / `signInWithGitHub()` — env-gated (only active when `GOOGLE_CLIENT_ID` / `GITHUB_CLIENT_ID` are set)
- Auth tables in `lib/db/schema/auth.ts` — **do not rename columns**, Better Auth owns them
- `user` table has extra fields: `plan` ("free"|"pro"), `lastVisitAt`, `lastReengagementAt`, `username` (unique), `publicProfile` (boolean) — declared in both the schema and `lib/auth.ts` `additionalFields`
- Session cookie cached for 5 minutes to avoid a DB hit on every page load
- **Never import `lib/auth.ts` in Edge routes or `middleware.ts`** — Better Auth requires Node.js `crypto`

### Database (lib/db/schema/)
Two files, both re-exported from `index.ts`:
- `auth.ts` — Better Auth tables: user, session, account, verification
- `app.ts` — Product tables: topics, rss_sources, rss_source_topics, articles, article_topics, user_topics, bookmarks, read_articles, digest_schedules, digest_logs, digest_log_articles, topic_suggestions, **article_feedback**

Key relations:
- `rss_sources` ↔ `topics` — many-to-many via `rss_source_topics`
- `rss_sources.qualityScore` — `real` (0.0–1.0, default 0.5); updated weekly by quality cron
- `articles` ↔ `topics` — many-to-many via `article_topics`
- `user` ↔ `topics` — many-to-many via `user_topics`
- `article_feedback` — unique on (userId, articleId, digestLogId); stores "up"/"down" rating
- `digest_schedules` — unique on (userId, topicId)
- `read_articles` — unique on (userId, articleId)
- `bookmarks` — unique on (userId, articleId)

After any schema change: `pnpm db:push` with the **direct** Neon connection string (PgBouncer breaks Drizzle's migration prepared statements).

### Topic icon system
`lib/topic-icons.ts` maps topic slugs → Lucide icons. `getTopicIcon(slug)` returns the mapped icon or `BookOpen` as fallback. `components/topic-icon.tsx` wraps this as `<TopicIcon slug={...} size={18} className={...} />`. When adding a new topic, add its slug→icon entry in `lib/topic-icons.ts` alongside the seed entry.

### UI components
- **No dark mode** — `ThemeProvider` has been removed from `app/layout.tsx`. Do not add `dark:` variants.
- **`<BetaBadge />`** (`components/ui/beta-badge.tsx`) — amber pill shown next to nav items or feature labels marked `beta={true}`. Sidebar's `renderNavItem` accepts `beta?: boolean` on nav config objects.

### HMAC tokens
Two separate HMAC-signed URL systems, both using `BETTER_AUTH_SECRET` as the key:
- **Unsubscribe tokens** (`lib/unsubscribe-token.ts`) — `userId:topicId` payload, used in digest emails
- **Feedback tokens** (`lib/feedback-token.ts`) — `userId:articleId:digestLogId:rating` payload, used in digest emails for 👍/👎 buttons. `logId` must be pre-generated before the email is sent (done in `lib/digest.ts`).

### Free tier gating
`/api/user/topics` POST returns 403 if `plan === "free"` and user already follows ≥5 topics. Frontend shows an upgrade prompt. The `plan` field is set to `"pro"` manually (no Stripe yet).

### SEO architecture
- `app/topics/[slug]/page.tsx` — public, SSG via `generateStaticParams`, `generateMetadata` per topic, JSON-LD `CollectionPage`
- `components/seo-landing.tsx` — reusable template for all 8 alternative/keyword landing pages
- Landing page (`app/page.tsx`) wraps all Framer Motion in `<MotionProvider>` (`MotionConfig reducedMotion="user"`) to respect system preferences and reduce CLS
- `public/og.png` (1200×630) — **not yet created**, referenced in root layout metadata

### API routes
| Route | Auth | Purpose |
|---|---|---|
| `/api/auth/[...all]` | — | Better Auth handler |
| `/api/cron/ingest` | CRON_SECRET | RSS ingestion (GET) |
| `/api/cron/digest` | CRON_SECRET | Digest sending (GET) |
| `/api/cron/cleanup` | CRON_SECRET | Delete articles >90 days old with no bookmarks (GET) |
| `/api/cron/quality` | CRON_SECRET | Recompute qualityScore on rss_sources (GET) |
| `/api/cron/reengage` | CRON_SECRET | Re-engagement emails for lapsed users (GET) |
| `/api/ingest` | session | Manual ingest trigger (POST) |
| `/api/topics` | none | All active topics (GET) |
| `/api/user/topics` | session | Followed topics (GET/POST) — 403 if free tier at limit |
| `/api/user/schedule` | session | Digest schedule (POST/DELETE) |
| `/api/user/read` | session | Mark article read/unread (POST, toggles) |
| `/api/user/visit` | session | Stamp lastVisitAt = now (POST) |
| `/api/user/account` | session | Delete account (DELETE) |
| `/api/user/profile` | session | Update display name (PATCH) |
| `/api/bookmarks` | session | Bookmarks (GET/POST) |
| `/api/topics/suggest` | session | Submit topic suggestion (POST) |
| `/api/user/digest-preview` | session | Preview digest email HTML (POST) |
| `/api/user/digest-history/[logId]` | session | Articles in a past digest (GET) |
| `/api/user/public-profile` | session | Set username + toggle publicProfile (PATCH) |
| `/api/user/sources/import` | session | OPML file import → upsert RSS sources (POST) |
| `/api/admin/topics` | ADMIN_EMAIL | Create topic (POST) |
| `/api/admin/topics/[id]` | ADMIN_EMAIL | Toggle active / update topic (PATCH) |
| `/api/admin/sources` | ADMIN_EMAIL | Create RSS source (POST) |
| `/api/admin/sources/[id]` | ADMIN_EMAIL | Toggle active (PATCH) |
| `/api/admin/assignments` | ADMIN_EMAIL | Assign/unassign source↔topic (POST/DELETE) |
| `/api/admin/suggestions/[id]/approve` | ADMIN_EMAIL | Approve suggestion → creates topic (POST) |
| `/api/admin/suggestions/[id]/reject` | ADMIN_EMAIL | Reject suggestion (POST) |

All routes return `{ data, error }`. All user input is validated with Zod inline in the route file.

### Neon DB connection (lib/db/index.ts)
Uses `@neondatabase/serverless` HTTP driver (no TCP sockets). Wraps `fetch` with `fetchWithRetry` for two failure modes:
1. **Node v20 Happy Eyeballs bug** — WSL2 + dual-stack DNS causes `AggregateError`. Fix: `NODE_OPTIONS=--no-network-family-autoselection` in `.env.local` (never set this in Vercel).
2. **Neon cold start** — free-tier compute suspends after 5 min idle. Retried with 100ms → 300ms → 700ms backoff.

### Cron security
All cron routes fail closed: missing or wrong `CRON_SECRET` → 401. Never fall open. All export `maxDuration = 300`.

### Digest timezone logic
Schedules store `hour` in UTC. `isScheduleDue(frequency, dayOfWeek, timezone, now)` in `lib/digest.ts` is a **pure exported function** — converts UTC to user's IANA timezone to check day-of-week. Tested in `__tests__/digest-schedule.test.ts`. Key edge case: Monday 12:00 UTC is still Monday in Tokyo (21:00 JST).

### Onboarding flow
`/sign-up` → email OTP verification → `/onboarding` (pick ≥1 topic) → `/onboarding/schedule` (digest time + timezone) → `/dashboard`

---

## Environment Variables
```
DATABASE_URL=             # Neon pooled connection string for runtime; use direct string for db:push
RESEND_API_KEY=           # Sends from noreply@m0nis.com (auth) and digest@m0nis.com (digests)
BETTER_AUTH_SECRET=       # ≥32 char secret; also HMAC key for unsubscribe + feedback tokens — never rotate casually
NEXT_PUBLIC_APP_URL=      # Exact origin, no trailing slash (http://localhost:3000 in dev)
CRON_SECRET=              # Bearer token for all /api/cron/* routes
ADMIN_EMAIL=              # Email that gets /admin access — checked against session.user.email
GOOGLE_CLIENT_ID=         # Optional — enables Google OAuth button on sign-in/sign-up
GOOGLE_CLIENT_SECRET=     # Optional
GITHUB_CLIENT_ID=         # Optional — enables GitHub OAuth button
GITHUB_CLIENT_SECRET=     # Optional
NODE_OPTIONS=--no-network-family-autoselection  # WSL2 only — local dev fix, never set in Vercel
```

---

## Testing

Test runner: **Vitest** (`vitest.config.ts`). Path alias `@/` configured there. Globals enabled — no need to import `describe`/`test`/`expect`.

```
__tests__/
  utils.test.ts                # slugify() — pure function
  digest-schedule.test.ts      # isScheduleDue() — pure function
  cron-auth.test.ts            # /api/cron/ingest auth — mocks @/lib/ingestion
  cron-digest-auth.test.ts     # /api/cron/digest auth
  free-tier.test.ts            # 5-topic limit on POST /api/user/topics
  unsubscribe-token.test.ts    # HMAC unsubscribe token round-trip
  feedback-token.test.ts       # HMAC feedback token round-trip
  admin.test.ts                # Admin route auth
```

Rules:
- Pure functions: import and call directly, no mocks
- Functions that import DB/Resend modules: `vi.mock()` at top of file — these call `neon()` / `new Resend()` at load time and crash without env vars
- Always use **fixed dates**, never `new Date()` — tests must be deterministic

---

## Conventions

**IDs** — `cuid2` on all primary keys: `id: text("id").primaryKey().$defaultFn(() => createId())`

**API shape** — always `{ data, error }`:
```ts
try {
  return NextResponse.json({ data: result, error: null })
} catch (e) {
  return NextResponse.json({ data: null, error: "message" }, { status: 500 })
}
```

**Account deletion** — delete `session` and `account` rows explicitly before `user` to avoid FK violations.

**Shared utilities** — `lib/utils.ts` exports `timeAgo`, `readingTime`, `initials`, `formatDate`, `monthLabel`, `slugify`. Import from there; do not redefine locally.

---

## Feature Roadmap

Market positioning: email-first article aggregator for developers/founders/researchers. Pocket (50M users) shut down July 2025 — live displaced audience. Competitor: Digest (usedigest.com) at $4.99/mo.

### Completed
- Reading streak + 7-day bar chart (`lib/db/queries/streak.ts`, `components/reading-streak.tsx`)
- "New articles since last visit" banner (`components/new-articles-banner.tsx`, `components/visit-tracker.tsx`)
- Digest article feedback via HMAC-signed URLs (`lib/feedback-token.ts`, `app/feedback/`, `article_feedback` table)
- Free tier: 5-topic limit on `POST /api/user/topics`
- Google + GitHub OAuth (env-gated, `lib/auth-client.ts`)
- Cold-start nudge when user follows <3 topics (`components/cold-start-nudge.tsx`)
- SEO: robots.ts, sitemap.ts, public topic pages (`/topics/[slug]`), 8 SEO landing pages, JSON-LD, MotionConfig
- Lapsed user re-engagement email (21-day threshold, 30-day cooldown, `app/api/cron/reengage/`)
- Extended seed: 26 topics + 275 sources (Reddit, YouTube, HN, Substack, Medium, Lobste.rs, TLDR, Changelog, GitHub Releases)
- "Top source" quality badge on article cards (`components/article-card.tsx`) — shown when `qualityScore >= 0.75`
- OPML import (`app/api/user/sources/import/route.ts`, `components/settings-opml-import.tsx`) — parses Feedly/Inoreader exports, fuzzy-matches folders to followed topics
- Shareable reading profile (`app/p/[username]/page.tsx`) — public SSR page with topics + recent articles + sign-up CTA; username/visibility managed via `components/settings-share-profile.tsx`
- Topic icons — Lucide icon per topic slug via `lib/topic-icons.ts` + `<TopicIcon>` component

### Remaining
| # | Feature | Why |
|---|---|---|
| 13 | Referral system | 40% of indie SaaS growth is WOM |
| 16 | Article highlights / annotations | Readwise territory — v3 |
| 17 | Digest sponsorship | At 5K+ subscribers |
| 18 | Niche feed sets ("HN for X") | v3 positioning |

### Monetization targets
- 500 paying @ $8/mo = $4K MRR (solo threshold)
- 1,000 paying = $8K MRR
- Comparable: Feedbin (solo, profitable 10+ yrs), Readwise (~$4.4M ARR small team)
