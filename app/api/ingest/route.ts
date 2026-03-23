import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ingestAllSources } from "@/lib/ingestion"

// Manual trigger — requires a logged-in session (for dev/admin use)
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await ingestAllSources()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[ingest/trigger]", err)
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 })
  }
}
