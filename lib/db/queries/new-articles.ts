import { db } from "@/lib/db"
import { articles, articleTopics, userTopics } from "@/lib/db/schema"
import { and, eq, gt, inArray, sql } from "drizzle-orm"

/** Count articles ingested after `since` that belong to topics the user follows. */
export async function getNewArticlesCount(userId: string, since: Date): Promise<number> {
  // Get the user's followed topic IDs
  const followed = await db
    .select({ topicId: userTopics.topicId })
    .from(userTopics)
    .where(eq(userTopics.userId, userId))

  if (followed.length === 0) return 0

  const topicIds = followed.map((r) => r.topicId)

  const [row] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${articles.id})` })
    .from(articles)
    .innerJoin(articleTopics, eq(articles.id, articleTopics.articleId))
    .where(
      and(
        inArray(articleTopics.topicId, topicIds),
        gt(articles.createdAt, since)
      )
    )

  return Number(row?.count ?? 0)
}
