import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/admin"
import { ingestAllSources } from "@/lib/ingestion"

// Manual trigger — requires a logged-in session (for dev/admin use)
export const maxDuration = 300

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const allowAnyAuthedInDev = process.env.NODE_ENV === "development" && !process.env.ADMIN_EMAIL
  if (!allowAnyAuthedInDev && !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const result = await ingestAllSources()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[ingest/trigger]", err)
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 })
  }
}
