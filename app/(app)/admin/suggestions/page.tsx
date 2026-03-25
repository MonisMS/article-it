import { db } from "@/lib/db"
import { topicSuggestions } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { AdminSuggestionsPanel } from "@/components/admin-suggestions-panel"

export default async function AdminSuggestionsPage() {
  const suggestions = await db.query.topicSuggestions.findMany({
    orderBy: desc(topicSuggestions.createdAt),
    with: {
      user: { columns: { name: true, email: true } },
    },
  })

  const mapped = suggestions.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    status: s.status,
    createdAt: s.createdAt,
    user: s.user,
  }))

  return <AdminSuggestionsPanel initialSuggestions={mapped} />
}
