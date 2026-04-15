import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { BookmarksClient, type BookmarkedArticle } from "./bookmarks-client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getReadArticleIds } from "@/lib/db/queries/articles"
import { bookmarks } from "@/lib/db/schema"

export const metadata: Metadata = {
  title: "Bookmarks - ArticleIt",
  description: "Your saved articles, organized by topic.",
}

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
      orderBy: (bookmark, { desc }) => desc(bookmark.createdAt),
    }),
    getReadArticleIds(session.user.id),
  ])

  const articles: BookmarkedArticle[] = rows.map((row) => ({
    ...row.article,
    articleTopics: row.article.articleTopics.map((articleTopic) => articleTopic.topic),
    savedAt: row.createdAt,
    isRead: readIds.has(row.article.id),
  }))

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6">
      <header className="border-b border-stone-200/80 pb-8 dark:border-[#1E2A3A]">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-[#6B7585]">
            Library
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6] sm:text-[2.4rem]">
            Your saved reading
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC] sm:text-base">
            A personal shelf for the pieces you want to return to, grouped and filtered without feeling like a dump of saved links.
          </p>
        </div>
      </header>

      <BookmarksClient initialArticles={articles} />
    </div>
  )
}
