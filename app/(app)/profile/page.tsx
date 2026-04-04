import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { topics, userTopics, digestSchedules, bookmarks } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { ProfileHero } from "@/components/profile-hero"
import { ProfileTabs } from "@/components/profile-tabs"
import { getReadingInsights } from "@/lib/db/queries/insights"

type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function ProfilePage({ searchParams }: Props) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  const { tab } = await searchParams
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
      <ProfileHero
        name={session.user.name}
        email={session.user.email}
        plan={plan}
        totalReads={insights.totalReads}
        bookmarkCount={bookmarkCount}
        topicCount={followedIds.length}
      />
      <ProfileTabs
        initialTab={tab ?? "overview"}
        insights={insights}
        bookmarkCount={bookmarkCount}
        name={session.user.name}
        email={session.user.email}
        plan={plan}
        allTopics={allTopics}
        followedIds={followedIds}
        followedTopics={followedTopics}
        schedules={schedules.map((s) => ({
          topicId: s.topicId,
          frequency: s.frequency,
          dayOfWeek: s.dayOfWeek,
          hour: s.hour,
          timezone: s.timezone,
          isActive: s.isActive,
        }))}
      />
    </div>
  )
}
