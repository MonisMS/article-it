import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { db } from "@/lib/db"
import { user, userTopics, articles, articleTopics, rssSources } from "@/lib/db/schema"
import { eq, desc, sql, inArray, and } from "drizzle-orm"
import { initials } from "@/lib/utils"
import { BookOpen, ExternalLink } from "lucide-react"
import { TopicIcon } from "@/components/topic-icon"

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profile = await db.query.user.findFirst({
    where: eq(user.username, username),
    columns: { name: true, publicProfile: true },
  })
  if (!profile?.publicProfile) return { title: "Profile not found" }
  return {
    title: `${profile.name}'s reading list · Curio`,
    description: `Follow ${profile.name}'s curated reading topics on Curio — quality-ranked articles from blogs, Reddit, YouTube, HN and newsletters.`,
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params

  const profile = await db.query.user.findFirst({
    where: eq(user.username, username),
    columns: { id: true, name: true, publicProfile: true },
  })

  if (!profile || !profile.publicProfile) notFound()

  const followed = await db.query.userTopics.findMany({
    where: eq(userTopics.userId, profile.id),
    with: { topic: { columns: { id: true, name: true, slug: true, icon: true } } },
  })

  const followedTopics = followed.map((f) => f.topic)
  const topicIds = followedTopics.map((t) => t.id)

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
        and(
          inArray(articles.id, db.select({ id: articleTopics.articleId }).from(articleTopics).where(inArray(articleTopics.topicId, topicIds))),
          sql`${articles.publishedAt} > NOW() - INTERVAL '14 days'`
        )
      )
      .orderBy(
        desc(
          sql`${articles.publishedAt} + (COALESCE(${rssSources.qualityScore}, 0.5) * INTERVAL '12 hours')`
        )
      )
      .limit(6)
    recentArticles = rows
  }

  const topicSlugs = followedTopics.map((t) => t.slug).join(",")
  const signUpUrl = `/sign-up?topics=${encodeURIComponent(topicSlugs)}`

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Nav */}
      <header className="border-b border-app-border bg-app-surface sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-app-text">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-app-accent text-white shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            Curio
          </Link>
          <Link
            href={signUpUrl}
            className="text-sm font-semibold bg-app-accent text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-black/10"
          >
            Follow these topics →
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Profile card */}
        <div className="rounded-3xl bg-app-surface border border-app-border shadow-sm shadow-black/5 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-app-accent-light flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-app-accent">{initials(profile.name)}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-app-text">{profile.name}&apos;s reading list</h1>
              <p className="text-sm text-app-text-muted mt-0.5">
                {followedTopics.length} topic{followedTopics.length !== 1 ? "s" : ""} · curated on Curio
              </p>
            </div>
          </div>

          {/* Topics */}
          {followedTopics.length > 0 && (
            <div className="mt-5 pt-5 border-t border-app-border">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-app-text-subtle mb-3">
                Topics followed
              </p>
              <div className="flex flex-wrap gap-2">
                {followedTopics.map((topic) => (
                  <span
                    key={topic.id}
                    className="inline-flex items-center gap-1.5 bg-app-surface-hover border border-app-border rounded-full px-3 py-1.5 text-sm font-medium text-app-text-muted"
                  >
                    <TopicIcon slug={topic.slug} size={13} className="shrink-0 text-app-accent" />
                    {topic.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent articles */}
        {recentArticles.length > 0 && (
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-app-text-subtle mb-3">
              Recent highlights
            </p>
            <div className="space-y-2">
              {recentArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 bg-app-surface border border-app-border rounded-2xl px-4 py-3.5 hover:border-app-border-strong hover:shadow-sm transition-all"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-app-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-app-text line-clamp-2 group-hover:text-app-accent transition-colors">
                      {article.title}
                    </p>
                    <p className="text-xs text-app-text-subtle mt-0.5">{article.sourceName}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-app-text-subtle shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="rounded-3xl bg-app-accent p-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Get this reading list in your inbox
          </h3>
          <p className="text-white/75 text-sm mb-6 leading-relaxed">
            Follow {profile.name}&apos;s {followedTopics.length} topic{followedTopics.length !== 1 ? "s" : ""} and get quality-ranked articles from blogs, Reddit, YouTube and newsletters — delivered on your schedule.
          </p>
          <Link
            href={signUpUrl}
            className="inline-flex items-center gap-2 bg-white text-app-accent font-semibold px-6 py-3 rounded-xl hover:opacity-95 transition-opacity text-sm shadow-sm shadow-black/10"
          >
            Follow these topics — it&apos;s free →
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-app-text-subtle pb-4">
          Powered by{" "}
          <Link href="/" className="font-medium text-app-text hover:text-app-accent transition-colors">
            Curio
          </Link>
          {" "}— one place for every topic you follow
        </p>
      </main>
    </div>
  )
}
