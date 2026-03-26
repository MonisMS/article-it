import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { bookmarks } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { ArticleCard, type ArticleCardData } from "@/components/article-card"
import { Bookmark, Compass } from "lucide-react"

export default async function BookmarksPage() {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  const rows = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, session.user.id),
    with: {
      article: {
        with: {
          source: { columns: { name: true } },
          articleTopics: {
            with: { topic: { columns: { id: true, name: true, icon: true, slug: true } } },
          },
        },
      },
    },
    orderBy: (b, { desc }) => desc(b.createdAt),
  })

  const articles = rows.map((r) => ({
    ...r.article,
    articleTopics: r.article.articleTopics.map((at) => at.topic),
    isBookmarked: true,
  }))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="pt-10 pb-6 px-4 sm:px-6 border-b border-app-border mb-6">
        <h1 className="text-3xl font-bold text-app-text tracking-tight">Bookmarks</h1>
        {articles.length > 0 && (
          <p className="text-app-text-subtle text-sm mt-1">
            {articles.length} saved article{articles.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-xl bg-app-accent-light flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-7 h-7 text-app-accent" />
          </div>
          <h2 className="text-xl font-semibold text-app-text">Nothing saved yet</h2>
          <p className="text-app-text-muted text-sm mt-2 max-w-sm mx-auto">
            Hit the bookmark icon on any article to save it here.
          </p>
          <Link
            href="/discover"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-app-accent px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Compass className="w-4 h-4" />
            Browse Discover
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5 px-4 sm:px-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article as ArticleCardData} />
          ))}
        </div>
      )}
    </div>
  )
}
