import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDigestLogArticles } from "@/lib/db/queries/history"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })
  }
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  const { logId } = await params
  const articles = await getDigestLogArticles(logId, session.user.id)

  if (articles === null) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ data: { articles }, error: null })
}
