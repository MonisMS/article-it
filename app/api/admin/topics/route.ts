import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { topics } from "@/lib/db/schema"
import { createId } from "@paralleldrive/cuid2"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  icon: z.string().max(10).optional(),
  description: z.string().max(300).optional(),
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

  try {
    const [row] = await db
      .insert(topics)
      .values({ id: createId(), ...body.data })
      .returning()
    return NextResponse.json({ data: row, error: null })
  } catch {
    return NextResponse.json({ data: null, error: "Slug already exists" }, { status: 409 })
  }
}
