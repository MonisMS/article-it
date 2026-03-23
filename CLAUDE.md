# ArticleIt — Claude Instructions

## What This Is
A personalized article aggregator. Ingests RSS feeds, matches articles to user topics, delivers weekly/daily email digests.

## Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Neon (Postgres) via Drizzle ORM
- **Auth:** Better Auth (added after core is built)
- **Email:** Resend
- **Scheduling:** Vercel Cron Jobs
- **Styling:** Tailwind CSS
- **Package manager:** pnpm (always use pnpm, never npm or yarn)

## Commands
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- DB push: `pnpm drizzle-kit push`
- DB studio: `pnpm drizzle-kit studio`
- DB generate: `pnpm drizzle-kit generate`

## Project Structure
```
app/                  Next.js App Router pages + API routes
app/api/              API routes (route.ts files)
lib/db/               Drizzle client + schema
lib/db/schema.ts      All table definitions
lib/db/queries/       Query functions per entity
lib/mock-user.ts      Hardcoded dev user (delete when auth is added)
components/           Reusable UI components
```

## Dev Rules
- Auth is NOT wired yet — use mock user from lib/mock-user.ts during development
- Always use pnpm, never npm or yarn
- Server components by default — add "use client" only when using hooks or browser APIs
- All API routes return { data, error } shape
- DB queries go in lib/db/queries/, never inline in components or API routes
- Use Drizzle query builder, never raw SQL
- Run `pnpm lint` before finishing any task

## API Response Shape
```ts
// Success
return NextResponse.json({ data: result, error: null })

// Error
return NextResponse.json({ data: null, error: "message" }, { status: 400 })
```

## Environment Variables (.env.local)
```
DATABASE_URL=          # Neon connection string
RESEND_API_KEY=        # Resend email API key
BETTER_AUTH_SECRET=    # Added when auth is wired
NEXT_PUBLIC_APP_URL=   # e.g. http://localhost:3000
```
