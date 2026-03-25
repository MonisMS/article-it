import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { topicSuggestions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

async function getAdminSession() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || !isAdmin(session.user.email)) return null
    return session
  } catch { return null }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await getAdminSession()) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const [row] = await db
    .update(topicSuggestions)
    .set({ status: "rejected" })
    .where(eq(topicSuggestions.id, id))
    .returning({ id: topicSuggestions.id })

  if (!row) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 })
  return NextResponse.json({ data: { ok: true }, error: null })
}
