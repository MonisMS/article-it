import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { topics, userTopics, digestSchedules } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { SettingsTopics } from "@/components/settings-topics"
import { SettingsSchedules } from "@/components/settings-schedules"
import { SettingsAccount } from "@/components/settings-account"

export default async function SettingsPage() {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  const userId = session.user.id

  const [allTopics, followed, schedules] = await Promise.all([
    db.query.topics.findMany({ where: eq(topics.isActive, true), orderBy: (t, { asc }) => asc(t.name) }),
    db.query.userTopics.findMany({ where: eq(userTopics.userId, userId) }),
    db.query.digestSchedules.findMany({ where: eq(digestSchedules.userId, userId) }),
  ])

  const followedIds = followed.map((f) => f.topicId)
  const followedTopics = allTopics.filter((t) => followedIds.includes(t.id))

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your topics, digests, and account.</p>
      </div>

      {/* Account */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Account</h2>
        <SettingsAccount
          name={session.user.name}
          email={session.user.email}
          plan={(session.user as { plan?: string }).plan ?? "free"}
        />
      </section>

      {/* Topics */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-zinc-900 mb-1">Your topics</h2>
        <p className="text-sm text-zinc-500 mb-4">Add or remove topics from your feed.</p>
        <SettingsTopics
          allTopics={allTopics}
          followedIds={followedIds}
        />
      </section>

      {/* Digest schedules */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-zinc-900 mb-1">Digest schedules</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Set a delivery schedule for each topic you follow.
        </p>
        {followedTopics.length === 0 ? (
          <p className="text-sm text-zinc-400">Follow some topics above first.</p>
        ) : (
          <SettingsSchedules
            topics={followedTopics}
            schedules={schedules.map((s) => ({
              topicId: s.topicId,
              frequency: s.frequency,
              dayOfWeek: s.dayOfWeek,
              hour: s.hour,
              isActive: s.isActive,
            }))}
          />
        )}
      </section>
    </div>
  )
}
