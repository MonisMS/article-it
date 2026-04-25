import { db } from "@/lib/db"
import { topics, rssSources } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"
import { AdminAssignmentsPanel } from "@/components/admin-assignments-panel"

export default async function AdminAssignmentsPage() {
  const [allTopics, allSources] = await Promise.all([
    db.query.topics.findMany({
      where: eq(topics.isActive, true),
      orderBy: asc(topics.name),
      columns: { id: true, name: true, slug: true, icon: true },
    }),
    db.query.rssSources.findMany({
      orderBy: asc(rssSources.name),
      columns: { id: true, name: true },
      with: {
        rssSourceTopics: {
          with: {
            topic: { columns: { id: true, name: true, slug: true, icon: true } },
          },
        },
      },
    }),
  ])

  const sources = allSources.map((s) => ({
    id: s.id,
    name: s.name,
    assignedTopics: s.rssSourceTopics.map((rst) => rst.topic),
  }))

  return <AdminAssignmentsPanel initialSources={sources} allTopics={allTopics} />
}
