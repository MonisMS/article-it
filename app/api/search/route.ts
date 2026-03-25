import { NextResponse } from "next/server"
import { searchArticles } from "@/lib/db/queries/articles"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""
  const page = Math.max(0, Number(searchParams.get("page") ?? 0))

  if (q.length < 2) {
    return NextResponse.json({ data: [], error: null })
  }

  try {
    const results = await searchArticles(q, page)
    return NextResponse.json({ data: results, error: null })
  } catch (e) {
    console.error("[api/search]", e)
    return NextResponse.json({ data: null, error: "Search failed" }, { status: 500 })
  }
}
