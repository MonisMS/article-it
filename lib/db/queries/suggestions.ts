import { db } from "@/lib/db"
import { topicSuggestions } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export type SuggestionRow = {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: Date
}

export async function getUserSuggestions(userId: string): Promise<SuggestionRow[]> {
  return db.query.topicSuggestions.findMany({
    where: eq(topicSuggestions.userId, userId),
    columns: { id: true, name: true, description: true, status: true, createdAt: true },
    orderBy: (t, { desc }) => desc(t.createdAt),
  })
}
