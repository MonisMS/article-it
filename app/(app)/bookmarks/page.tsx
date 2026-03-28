import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { bookmarks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getReadArticleIds } from "@/lib/db/queries/articles"
import { BookmarksClient, type BookmarkedArticle } from "./bookmarks-client"

export default async function BookmarksPage() {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  const [rows, readIds] = await Promise.all([
    db.query.bookmarks.findMany({
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
    }),
    getReadArticleIds(session.user.id),
  ])

  const articles: BookmarkedArticle[] = rows.map((r) => ({
    ...r.article,
    articleTopics: r.article.articleTopics.map((at) => at.topic),
    savedAt: r.createdAt,
    isRead: readIds.has(r.article.id),
  }))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="pt-10 pb-6 px-4 sm:px-6 border-b border-stone-200 dark:border-[#1E2A3A] mb-6 bg-gradient-to-b from-stone-50 dark:from-[#161C26]/50 to-transparent">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-[#F0EDE6] tracking-tight">Library</h1>
            <p className="text-stone-400 dark:text-[#6B7585] text-sm mt-1">Your saved articles, organized by topic.</p>
          </div>
        </div>
      </div>

      <BookmarksClient initialArticles={articles} />
    </div>
  )
}
