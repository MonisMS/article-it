import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { db } from "@/lib/db"
import { user, userTopics, articles, articleTopics, rssSources } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import { initials } from "@/lib/utils"
import { BookOpen } from "lucide-react"

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profile = await db.query.user.findFirst({
    where: eq(user.username, username),
    columns: { name: true, publicProfile: true },
  })
  if (!profile?.publicProfile) return { title: "Profile not found" }
  return {
    title: `${profile.name}'s reading list`,
    description: `Follow ${profile.name}'s curated reading topics on ArticleIt.`,
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params

  const profile = await db.query.user.findFirst({
    where: eq(user.username, username),
    columns: { id: true, name: true, publicProfile: true },
  })

  if (!profile || !profile.publicProfile) notFound()

  // Get followed topics
  const followed = await db.query.userTopics.findMany({
    where: eq(userTopics.userId, profile.id),
    with: { topic: { columns: { id: true, name: true, slug: true, icon: true } } },
  })

  const followedTopics = followed.map((f) => f.topic)
  const topicIds = followedTopics.map((t) => t.id)

  // Get top 5 recent articles from their topics (last 14 days)
  let recentArticles: { id: string; title: string; url: string; sourceName: string }[] = []
  if (topicIds.length > 0) {
    const rows = await db
      .select({
        id: articles.id,
        title: articles.title,
        url: articles.url,
        sourceName: rssSources.name,
      })
      .from(articles)
      .innerJoin(rssSources, eq(rssSources.id, articles.sourceId))
      .where(
        sql`EXISTS (
          SELECT 1 FROM ${articleTopics}
          WHERE ${articleTopics.articleId} = ${articles.id}
          AND   ${articleTopics.topicId} IN ${sql.raw(`('${topicIds.join("','")}')`)}
        )
        AND ${articles.publishedAt} > NOW() - INTERVAL '14 days'`
      )
      .orderBy(
        desc(
          sql`${articles.publishedAt} + (COALESCE(${rssSources.qualityScore}, 0.5) * INTERVAL '12 hours')`
        )
      )
      .limit(5)
    recentArticles = rows
  }

  const topicSlugs = followedTopics.map((t) => t.slug).join(",")
  const signUpUrl = `/sign-up?topics=${encodeURIComponent(topicSlugs)}`

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0D1117]">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900 dark:text-[#F0EDE6]">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-900 dark:bg-[#E8A838] text-white dark:text-[#0D1117] flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            ArticleIt
          </Link>
          <Link
            href={signUpUrl}
            className="text-sm font-semibold bg-stone-900 dark:bg-amber-500 text-white dark:text-[#0D1117] px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Follow these topics →
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Profile card */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-[#2A3547] flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-amber-700 dark:text-[#E8A838]">{initials(profile.name)}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-[#F0EDE6]">{profile.name}’s reading list</h1>
            <p className="text-sm text-stone-500 dark:text-[#6B7585] mt-0.5">
              {followedTopics.length} topic{followedTopics.length !== 1 ? "s" : ""} · curated on ArticleIt
            </p>
          </div>
        </div>

        {/* Topics */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-[#6B7585] mb-3">Topics</h2>
          <div className="flex flex-wrap gap-2">
            {followedTopics.map((topic) => (
              <span
                key={topic.id}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#161C26] border border-stone-200 dark:border-[#1E2A3A] rounded-full px-3 py-1.5 text-sm font-medium text-stone-700 dark:text-[#B8C0CC]"
              >
                {topic.icon && <span>{topic.icon}</span>}
                {topic.name}
              </span>
            ))}
          </div>
        </section>

        {/* Recent articles */}
        {recentArticles.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-[#6B7585] mb-3">
              Recent highlights
            </h2>
            <div className="space-y-2">
              {recentArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 bg-white dark:bg-[#161C26] border border-stone-200 dark:border-[#1E2A3A] rounded-xl px-4 py-3 hover:border-stone-300 dark:hover:border-[#2D3B4F] hover:shadow-sm transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 dark:text-[#F0EDE6] line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-[#E8A838] transition-colors">
                      {article.title}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5">{article.sourceName}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-amber-950 p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Get this reading list in your inbox</h3>
          <p className="text-stone-400 text-sm mb-5">
            Follow {profile.name}’s {followedTopics.length} topics and get quality-ranked articles delivered to your email on your schedule. Free to start.
          </p>
          <Link
            href={signUpUrl}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Follow these topics — it’s free →
          </Link>
        </div>
      </main>
    </div>
  )
}
