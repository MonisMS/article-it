# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
ArticleIt — a personalized article aggregator. RSS feeds are ingested into Postgres daily. Users pick topics, get a personalized feed ranked by source quality, and receive scheduled email digests via Resend.

---

## Version 2 — Planned

### Resource optimisation (cron frequency)
~~Done (2026-03-26)~~: Ingest now runs once daily at 06:00 UTC. Digest runs hourly but only 06:00–22:00 UTC (17 runs/day vs 24). Both `.github/workflows/cron-*.yml` files updated.

### New content sources
Expand beyond RSS feeds to pull content from:
- Reddit (subreddit feeds — Reddit exposes RSS at `reddit.com/r/topic.rss`)
- Twitter/X (needs API v2, paid tier — revisit when monetised)
- Hacker News (already has RSS — low hanging fruit, add to seed)
- YouTube channel feeds (RSS supported natively)
- Newsletter archives (Substack exposes RSS)

This will require sourcing changes in `lib/ingestion.ts` and potentially new source types in the schema.

### Full UI revamp
- ~~Proper design system / component library decision~~ — **done (2026-03-26)**: shadcn/ui installed, semantic color tokens throughout (`--color-app-*` prefix), `components/ui/` has Button, Badge, Input, Separator
- ~~Better mobile layout~~ — **done (2026-03-26)**: mobile nav is now icon-only with accent dot indicator; `aria-label` + `title` for accessibility
- ~~UI polish pass~~ — **done (2026-03-26)**: neutral grey palette, `rounded-xl` throughout, page headers with `border-b` separators, settings sections in card containers
- ~~Design system overhaul~~ — **done (2026-03-28)**: warmer stone palette replacing zinc, shadow scale (`--shadow-xs/sm/md/lg`), gradient tokens, unified `app-*` and shadcn tokens
- ~~Auth pages~~ — **done (2026-03-28)**: left panel gradient, password strength meter on sign-up, consistent use of `Input`/`Button` components
- ~~Email verification~~ — **done (2026-03-28)**: replaced magic link with 6-digit OTP (`emailOTP` plugin). `sendVerificationOTP` in `lib/auth.ts`, `emailOTPClient` in `lib/auth-client.ts`, OTP email template at `lib/email/otp-template.ts`
- ~~Onboarding~~ — **done (2026-03-28)**: complete redesign. Dark immersive experience matching landing page (`#080C12` bg, animated aurora orbs, glass-morphism topic cards, Framer Motion throughout). Step 1: floating selection shelf, spring physics, staggered card entrance. Step 2: two-column layout, custom time picker (no `<select>`), frequency cards, live digest preview card, `AnimatePresence` for all transitions
- ~~Dashboard~~ — **done (2026-03-28)**: article cards with reading time, hover lift, amber dot badge, read-state left border. Daily queue now horizontal scroll strip with progress bar. Digest preview has dashed amber border + gradient. Topic filter pills use amber active state. Sidebar has initials avatar, pill active state (no left border)
- ~~Discover~~ — **done (2026-03-28)**: topic grid uses 10-color gradient cards (color derived from topic name hash for consistency). Topic detail page gets full-width gradient hero banner matching topic color
- ~~Article reading experience~~ — **done (2026-03-28)**: covered by article card redesign (reading time, hover lift, amber dot badge, read-state border)
- ~~Bookmarks~~ — **done (2026-03-28)**: full library redesign — stats bar (saved/read/mins left), topic filter pills, grouped-by-topic default view, sort toggle, animated cards with `savedAt` timestamp, live unbookmark removes card. `BookmarkButton` now has `onToggle` prop.
- ~~History~~ — **done (2026-03-28)**: timeline grouped by month, stats (digests sent + articles delivered), animated accordion rows with rotating chevron, article list stagger animation, fixed duplicate topic name bug.
- ~~Profile~~ — **done (2026-03-28)**: `ProfileHero` component with avatar (amber gradient initials), name/email/plan badge, stat row (reads/bookmarks/topics). Reading insights redesigned with animated topic bar chart, stat strip, top source/topic rows.
- ~~Search~~ — **done (2026-03-28)**: idle state has centered hero layout with large input and suggestion pills. `SearchBarHero` component with amber submit button. Fixed all `zinc` → `stone` colors.
- ~~Suggest~~ — **done (2026-03-28)**: header with how-it-works 3-step strip, amber form inputs with character counters, animated success/error states, suggestion list with status icons (clock/checkmark/X) and `timeAgo` timestamps.
- ~~Upgrade~~ — **done (2026-03-28)**: real pricing page — dark gradient header with amber glow, Free vs Pro comparison cards, Pro features list, honest "coming soon" CTA.
- ~~Landing page hero~~ — **done (2026-03-28)**: added `ProductMock` component — browser frame with sidebar + article card grid animates in after CTAs. Shows real app layout with colored accent bars per topic.
- Dark mode

### Other v2 items
- Google / GitHub OAuth login (Better Auth supports it — add providers in `lib/auth.ts`)
- ~~Forget password page UX~~ — **done (2026-03-26)**
- Pro plan implementation — `plan` field + `ADMIN_EMAIL` guard already in place, just needs Stripe + feature gating
- Article deduplication across sources (same article from two feeds gets stored once)
- ~~Neon storage monitoring~~ — **done (2026-03-26)**: `app/api/cron/cleanup/route.ts` + `.github/workflows/cron-cleanup.yml` (Sunday 03:00 UTC). Deletes articles older than 90 days with no bookmarks.
- ~~Source quality scoring~~ — **done (2026-03-26)**: `qualityScore` on `rss_sources`, updated weekly by `/api/cron/quality` (Sunday 04:00 UTC). Formula: `bookmarks × 0.6 + reads × 0.4`, minimum 5 interactions threshold.
- ~~Daily reading queue~~ — **done (2026-03-26)**: `DailyQueue` component on dashboard — top 5 unread articles with progress tracking. No persistence; dynamic on page load.
- ~~First-digest preview~~ — **done (2026-03-26)**: `DigestPreview` shows on dashboard until first real digest fires (`hasReceivedDigest` check).
- ~~Weekly reading stats in digest~~ — **done (2026-03-26)**: `getWeeklyReadingStats()` in `lib/digest.ts`, injected into email template as a single summary line.

## Commands
```bash
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm test             # Run all tests once (use before deploying)
pnpm test:watch       # Re-run tests on file save (use during development)
pnpm db:push          # Push Drizzle schema to Neon — use the DIRECT connection string, not pooled
pnpm db:studio        # Open Drizzle Studio in browser
pnpm db:seed          # Seed 12 topics + 47 RSS sources + 15 GitHub release feeds into DB
```

Always use `pnpm`. Never `npm` or `yarn`.

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
    history/      → /history (digest send history)
    settings/     → /settings
    suggest/      → /suggest (topic suggestions)
    upgrade/      → /upgrade (coming soon page)
    admin/        → /admin/* (ADMIN_EMAIL only — 404 for everyone else)
      topics/     → /admin/topics
      sources/    → /admin/sources
      assignments/→ /admin/assignments
      suggestions/→ /admin/suggestions
  (auth)/         ← public auth pages (sign-in, sign-up, etc.)
  api/            ← API routes
  page.tsx        ← landing page
```

### Data flow
```
GitHub Actions (daily 06:00 UTC)
  → GET /api/cron/ingest   (Authorization: Bearer CRON_SECRET)
  → lib/ingestion.ts       (parallel RSS fetch, 8s timeout per source)
  → articles table         (deduped by url — onConflictDoNothing)
  → article_topics table

GitHub Actions (hourly 06:00–22:00 UTC)
  → GET /api/cron/digest   (Authorization: Bearer CRON_SECRET)
  → lib/digest.ts          (finds schedules matching current UTC hour)
  → Resend email           (HTML template + HMAC-signed unsubscribe link)
  → digest_logs table

GitHub Actions (Sunday 04:00 UTC)
  → GET /api/cron/quality  (Authorization: Bearer CRON_SECRET)
  → updates rss_sources.qualityScore for sources with ≥5 interactions
  → formula: bookmarks × 0.6 + reads × 0.4, capped at 1.0

User visits /dashboard
  → getArticlesForUser()   quality-blended ranking: publishedAt + (qualityScore × 12h)
  → getDailyQueue()        top 5 unread articles (same ranking)
  → ArticleCard            shows imageUrl if present, read/bookmark state
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
- `rss_sources.qualityScore` — `real` (0.0–1.0, default 0.5); updated weekly by quality cron
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
| `/api/cron/cleanup` | CRON_SECRET | Delete articles >90 days old with no bookmarks (GET) |
| `/api/cron/quality` | CRON_SECRET | Recompute qualityScore on rss_sources (GET) |
| `/api/ingest` | session | Manual ingest trigger (POST) |
| `/api/topics` | none | All active topics (GET) |
| `/api/user/topics` | session | Followed topics (GET/POST) |
| `/api/user/schedule` | session | Digest schedule (POST/DELETE) |
| `/api/user/read` | session | Mark article read/unread (POST, toggles) |
| `/api/user/account` | session | Delete account (DELETE) |
| `/api/user/profile` | session | Update display name (PATCH) |
| `/api/bookmarks` | session | Bookmarks (GET/POST) |
| `/api/topics/suggest` | session | Submit topic suggestion (POST) |
| `/api/user/digest-preview` | session | Preview digest email HTML (POST) |
| `/api/user/digest-history/[logId]` | session | Articles in a past digest (GET) |
| `/api/admin/topics` | ADMIN_EMAIL | Create topic (POST) |
| `/api/admin/topics/[id]` | ADMIN_EMAIL | Toggle active / update topic (PATCH) |
| `/api/admin/sources` | ADMIN_EMAIL | Create RSS source (POST) |
| `/api/admin/sources/[id]` | ADMIN_EMAIL | Toggle active (PATCH) |
| `/api/admin/assignments` | ADMIN_EMAIL | Assign/unassign source↔topic (POST/DELETE) |
| `/api/admin/suggestions/[id]/approve` | ADMIN_EMAIL | Approve suggestion → creates topic (POST) |
| `/api/admin/suggestions/[id]/reject` | ADMIN_EMAIL | Reject suggestion (POST) |

All routes return `{ data, error }`. All user input is validated with Zod inline in the route file.

### Neon DB connection (lib/db/index.ts)
Uses `@neondatabase/serverless` HTTP driver (no TCP sockets — works in all runtimes). The client wraps native `fetch` with a retry function (`fetchWithRetry`) that handles two failure modes:
1. **Node v20 Happy Eyeballs bug** — WSL2 + dual-stack DNS causes `AggregateError` after 250ms. Mitigated by `NODE_OPTIONS=--no-network-family-autoselection` in `.env.local`.
2. **Neon cold start** — free-tier compute suspends after 5 min idle; first query fails. Retried with 100ms → 300ms → 700ms backoff.

### Cron security
All cron routes fail closed: `if (!cronSecret || authHeader !== \`Bearer ${cronSecret}\`)`. If `CRON_SECRET` env var is missing the endpoint returns 401, it does not fall open. All export `maxDuration = 300` (requires Vercel Pro; ignored on Hobby).

### Digest timezone logic
Schedules store `hour` in UTC. For weekly digests, `lib/digest.ts` converts the current UTC time to the user's `timezone` (IANA string) to check the day-of-week match. Never assume UTC == local time.

The matching logic is extracted as `isScheduleDue(frequency, dayOfWeek, timezone, now)` — a **pure exported function** so it can be unit tested without a DB. Tests live in `__tests__/digest-schedule.test.ts`. Key edge case: Monday 12:00 UTC is still Monday in Tokyo (21:00 JST) — Tuesday in Tokyo doesn't begin until 15:00 UTC.

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
ADMIN_EMAIL=            # Email address that gets access to /admin panel — checked against session.user.email
NODE_OPTIONS=--no-network-family-autoselection   # WSL2 fix for Node v20 fetch AggregateError — local dev only, do not set in Vercel
```

---

## Testing

Test runner: **Vitest** (`vitest.config.ts`). Path alias `@/` is configured there.

```
__tests__/
  utils.test.ts           # slugify() — pure function, no mocks needed
  digest-schedule.test.ts # isScheduleDue() — pure function, no mocks needed
  cron-auth.test.ts       # /api/cron/ingest auth — mocks @/lib/ingestion
```

**Rules for writing new tests:**
- Pure functions (no DB/network): import and call directly, no mocks needed
- Functions that import DB modules: mock `@/lib/db`, `@/lib/resend` etc. at the top of the test file using `vi.mock()` — these modules call `neon()` and `new Resend()` at load time and will crash without env vars
- Always use **fixed dates** (not `new Date()`) so tests are deterministic regardless of when they run
- Run `pnpm test` before every deploy

**What NOT to test yet:** React components (UI testing requires more setup — deferred).

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

---

## Feature Roadmap (researched 2026-04-04)

Market research confirmed: personalized email digest aggregators have a durable niche. Pocket (50M users) shut down July 2025 — live displaced audience. Direct competitor: Digest (usedigest.com) at $4.99/mo. Target user: developer/researcher/founder, 28-45, tools budget, wants curated inbox briefing without RSS complexity.

### What's Built (verified in code)
- Quality-blended feed ranking (`publishedAt + qualityScore × 12h`)
- Weekly quality scoring cron (bookmarks × 0.6 + reads × 0.4, 90-day window, min 5 interactions)
- RSS ingestion with deduplication, image extraction, 8s timeout
- Full-text PostgreSQL search with hero state + suggestion pills
- Daily Queue: top 5 unread, cross-topic, progress bar, completion state
- Digest Preview widget (shown until first real digest fires)
- Article cards: reading time, images, read/bookmark state, hover lift
- Discover: gradient topic grid (color from name hash), topic detail hero
- Bookmarks: grouped by topic, stats bar (saved/read/mins left), sort + filter
- History: monthly timeline, expandable digest rows, lazy-load articles
- Profile: hero (initials + plan badge), stat row, reading insights
- Reading Insights: 7/30/all-time reads, top topic, per-topic bar charts, ignored topics alert
- Search: full-text results, hero idle state with suggestion pills
- Suggest: character counters, animated success/error, suggestion list with timestamps
- Upgrade: Free vs Pro comparison, honest "coming soon" CTA (no Stripe)
- Email digest: HTML template, first-name greeting, up to 10 articles, weekly summary line, HMAC unsubscribe
- 2-step onboarding: topic selection (animated) → schedule (custom time picker, timezone detection, live preview)
- Admin: topics, sources, assignments, suggestions management

### Feature Roadmap (prioritized by research evidence)

| # | Feature | Tier | Why | Effort |
|---|---|---|---|---|
| 1 | Reading streak + weekly progress card | 1 — Habit | Highest retention evidence; data already in read_articles | Low |
| 2 | "New articles since last visit" urgency signal | 1 — Habit | Time-anchor pull-back; prevents dormancy | Low |
| 3 | Digest article feedback (thumbs per article via signed URL) | 1 — Personalization | Negative signal loop; improves quality scoring | Medium |
| 4 | Stripe + Pro plan enforcement | 2 — Revenue | Plan field + pricing page exist; just needs Stripe wired | Medium |
| 5 | SEO landing pages (Pocket alt, personalized digest, etc.) | 2 — Revenue | Distribution is the hard problem; Pocket users are searching now | Low (content) |
| 6 | Feed staleness detection + re-onboarding prompt | 3 — Retention | #2 cause of RSS abandonment; sources drift silently | Low |
| 7 | Cold-start guard (min 3 topics, pre-curated best-of) | 3 — Retention | 72% of app churn in first 72 hours | Low |
| 8 | Lapsed user re-engagement email (21+ days no reads) | 3 — Retention | 8-14% churn reduction; no such mechanism exists yet | Medium |
| 9 | Reddit subreddit sources (seed data only) | 4 — Content | Zero code change; infrastructure handles it | Very Low |
| 10 | Hacker News feeds (seed data only) | 4 — Content | Target audience uses HN daily | Very Low |
| 11 | YouTube channel feeds (seed data only) | 4 — Content | RSS-native; image extraction already handles YT thumbnails | Very Low |
| 12 | Google / GitHub OAuth | 5 — Acquisition | Drops signup friction; Better Auth supports both | Low |
| 13 | Referral system | 5 — Acquisition | 40% of indie SaaS success is WOM | Medium |
| 14 | OPML import | 5 — Acquisition | Unlocks Feedly/Inoreader refugees with years of curated feeds | Medium |
| 15 | Dark mode | 6 — Polish | Table stakes in 2026 | Medium |
| 16 | Article highlights / annotations | 6 — Future | Readwise territory; not urgent for v2 | High |
| 17 | Digest sponsorship model | 6 — Future | Ad-supported at 5K+ subscribers; not now | High |
| 18 | Niche-specific curated feed sets ("HN for X") | 6 — Future | v3 positioning angle; requires source curation work | High |

### Monetization targets
- 500 paying users @ $8/mo = $4K MRR (solo profitability threshold)
- 1,000 paying users = $8K MRR
- Comparable: Feedbin (solo, profitable 10+ yrs at $5/mo), Readwise (~$4.4M ARR small team)
