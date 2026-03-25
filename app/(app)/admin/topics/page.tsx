import { db } from "@/lib/db"
import { topics } from "@/lib/db/schema"
import { asc } from "drizzle-orm"
import { AdminTopicsPanel } from "@/components/admin-topics-panel"

export default async function AdminTopicsPage() {
  const allTopics = await db.query.topics.findMany({
    orderBy: asc(topics.name),
  })

  return <AdminTopicsPanel initialTopics={allTopics} />
}
