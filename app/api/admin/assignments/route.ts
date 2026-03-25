import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { rssSourceTopics } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

const schema = z.object({
  sourceId: z.string().min(1),
  topicId: z.string().min(1),
})

async function getAdminSession() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || !isAdmin(session.user.email)) return null
    return session
  } catch { return null }
}

export async function POST(req: Request) {
  if (!await getAdminSession()) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
  }

  const body = schema.safeParse(await req.json())
  if (!body.success) {
    return NextResponse.json({ data: null, error: "Invalid input" }, { status: 400 })
  }

  await db.insert(rssSourceTopics).values(body.data).onConflictDoNothing()
  return NextResponse.json({ data: { ok: true }, error: null })
}

export async function DELETE(req: Request) {
  if (!await getAdminSession()) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
  }

  const body = schema.safeParse(await req.json())
  if (!body.success) {
    return NextResponse.json({ data: null, error: "Invalid input" }, { status: 400 })
  }

  await db
    .delete(rssSourceTopics)
    .where(
      and(
        eq(rssSourceTopics.sourceId, body.data.sourceId),
        eq(rssSourceTopics.topicId, body.data.topicId)
      )
    )

  return NextResponse.json({ data: { ok: true }, error: null })
}
