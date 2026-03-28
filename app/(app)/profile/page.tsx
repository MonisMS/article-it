import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { topics, userTopics, digestSchedules, bookmarks } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { SettingsTopics } from "@/components/settings-topics"
import { SettingsSchedules } from "@/components/settings-schedules"
import { SettingsAccount } from "@/components/settings-account"
import { ReadingInsights } from "@/components/reading-insights"
import { ProfileHero } from "@/components/profile-hero"
import { getReadingInsights } from "@/lib/db/queries/insights"

export default async function ProfilePage() {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  const userId = session.user.id

  const [allTopics, followed, schedules, bookmarkCount, insights] = await Promise.all([
    db.query.topics.findMany({ where: eq(topics.isActive, true), orderBy: (t, { asc }) => asc(t.name) }),
    db.query.userTopics.findMany({ where: eq(userTopics.userId, userId) }),
    db.query.digestSchedules.findMany({ where: eq(digestSchedules.userId, userId) }),
    db.select({ count: count() }).from(bookmarks).where(eq(bookmarks.userId, userId)).then((r) => r[0]?.count ?? 0),
    getReadingInsights(userId),
  ])

  const followedIds = followed.map((f) => f.topicId)
  const followedTopics = allTopics.filter((t) => followedIds.includes(t.id))
  const plan = (session.user as { plan?: string }).plan ?? "free"

  return (
    <div className="max-w-3xl mx-auto pb-16">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <ProfileHero
        name={session.user.name}
        email={session.user.email}
        plan={plan}
        totalReads={insights.totalReads}
        bookmarkCount={bookmarkCount}
        topicCount={followedIds.length}
      />

      <div className="px-4 sm:px-6 flex flex-col gap-5 mt-8">

        {/* ── Reading insights ─────────────────────────────────── */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-[#C8C4BC]">Reading insights</h2>
            <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5">How you've been engaging with your feed.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] overflow-hidden">
            <ReadingInsights insights={insights} bookmarkCount={bookmarkCount} />
          </div>
        </section>

        {/* ── Account ──────────────────────────────────────────── */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-[#C8C4BC]">Account</h2>
            <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5">Your profile and plan details.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-6">
            <SettingsAccount
              name={session.user.name}
              email={session.user.email}
              plan={plan}
            />
          </div>
        </section>

        {/* ── Topics ───────────────────────────────────────────── */}
        <section id="topics">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-[#C8C4BC]">Topics</h2>
            <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5">Add or remove topics from your feed.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-6">
            <SettingsTopics allTopics={allTopics} followedIds={followedIds} />
          </div>
        </section>

        {/* ── Digest schedules ─────────────────────────────────── */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-[#C8C4BC]">Digest schedules</h2>
            <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5">Set a delivery schedule for each topic you follow.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-6">
            {followedTopics.length === 0 ? (
              <p className="text-sm text-stone-400">Follow some topics above first.</p>
            ) : (
              <SettingsSchedules
                topics={followedTopics}
                schedules={schedules.map((s) => ({
                  topicId: s.topicId,
                  frequency: s.frequency,
                  dayOfWeek: s.dayOfWeek,
                  hour: s.hour,
                  timezone: s.timezone,
                  isActive: s.isActive,
                }))}
              />
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
