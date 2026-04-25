import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { searchFeedForUser } from "@/lib/db/queries/articles"

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""
  const page = Math.max(0, Number(searchParams.get("page") ?? 0))

  if (q.length < 2 || q.length > 200) {
    return NextResponse.json({ data: { articles: [], topics: [] }, error: null })
  }

  try {
    const results = await searchFeedForUser(session.user.id, q, page)
    return NextResponse.json({ data: results, error: null })
  } catch (e) {
    console.error("[api/search]", e)
    return NextResponse.json({ data: null, error: "Search failed" }, { status: 500 })
  }
}
