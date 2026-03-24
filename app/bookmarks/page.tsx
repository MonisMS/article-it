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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Bookmarks</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {articles.length === 0 ? "No bookmarks yet." : `${articles.length} saved article${articles.length === 1 ? "" : "s"}.`}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 mb-4">
            <Bookmark className="w-5 h-5 text-zinc-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Hit the bookmark icon on any article to save it here.
          </p>
          <Link
            href="/discover"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Browse Discover
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article as ArticleCardData} />
          ))}
        </div>
      )}
    </div>
  )
}
