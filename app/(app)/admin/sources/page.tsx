import { db } from "@/lib/db"
import { rssSources } from "@/lib/db/schema"
import { asc } from "drizzle-orm"
import { AdminSourcesPanel } from "@/components/admin-sources-panel"

export default async function AdminSourcesPage() {
  const allSources = await db.query.rssSources.findMany({
    orderBy: asc(rssSources.name),
  })

  return <AdminSourcesPanel initialSources={allSources} />
}
