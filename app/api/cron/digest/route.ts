import { NextResponse } from "next/server"
import { runDigests } from "@/lib/digest"

// Vercel Cron calls this every hour — it checks internally who is due
export const maxDuration = 300 // requires Vercel Pro

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await runDigests()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[cron/digest]", err)
    return NextResponse.json({ error: "Digest run failed" }, { status: 500 })
  }
}
