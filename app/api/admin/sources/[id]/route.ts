import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { rssSources } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const schema = z.object({ isActive: z.boolean() })

async function getAdminSession() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || !isAdmin(session.user.email)) return null
    return session
  } catch { return null }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await getAdminSession()) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
  }

  const body = schema.safeParse(await req.json())
  if (!body.success) {
    return NextResponse.json({ data: null, error: "Invalid input" }, { status: 400 })
  }

  const { id } = await params
  const [row] = await db
    .update(rssSources)
    .set({ isActive: body.data.isActive })
    .where(eq(rssSources.id, id))
    .returning()

  if (!row) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 })
  return NextResponse.json({ data: row, error: null })
}
