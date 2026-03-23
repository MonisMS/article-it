---
name: ArticleIt Project
description: Core facts about the ArticleIt project being built - stack, approach, current state
type: project
---

Personalized article aggregator + email digest service. Users pick topics, get weekly/daily emails with article links from RSS feeds.

**Stack:** Next.js 16 (App Router), Neon Postgres, Drizzle ORM, Better Auth, Resend, Vercel Cron, Tailwind, pnpm

**Build order completed:**
1. DB schema + Drizzle ✅
2. Better Auth ✅
3. Landing page + Sign up/Sign in ✅
4. RSS ingestion pipeline ✅
5. Onboarding (topic + schedule) ✅
6. Dashboard with article feed ✅

**Still to build:**
- Bookmarks (button exists in UI, API + toggle missing)
- Email digest cron (/api/cron/digest via Resend) — the core monetizable feature
- Settings page (manage topics + schedule)
- Redis caching for topic filter switching (currently slow, full server re-render per tab click)
- Discover page

**Redis note:** Add Redis (Upstash) for caching article queries per user+topic. Topic switching is slow because it's a full server component re-render + DB query every click. Cache key: `articles:{userId}:{topicSlug}:{page}`, TTL 5 minutes, invalidate on ingest.

**Marketing articles issue:** User reported no articles showing under Marketing filter. Moz Blog (10 articles) and Neil Patel fetched OK. Likely the user didn't follow Marketing during onboarding so it's not in their user_topics. Fix: go to settings and add Marketing topic, or re-do onboarding.

**Monetization plan:** Free = manual search. Pro ($8/mo) = scheduled email digests.

**Current state:** Core feed working. Bookmarks, digest email, and settings are next.
