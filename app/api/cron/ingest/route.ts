import { NextResponse } from "next/server"
import { ingestAllSources } from "@/lib/ingestion"

// Vercel Cron calls this every 6 hours (configured in vercel.json)
// Protected by CRON_SECRET so only Vercel can trigger it
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await ingestAllSources()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[cron/ingest]", err)
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 })
  }
}
