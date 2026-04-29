import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { and, eq, ne } from "drizzle-orm"
import { slugify } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ available: false, error: "Unauthorized" }, { status: 401 })

  const raw = req.nextUrl.searchParams.get("username") ?? ""
  const clean = slugify(raw).replace(/\s+/g, "-").slice(0, 30)

  if (!clean || clean.length < 2) {
    return NextResponse.json({ available: false, error: "Username must be at least 2 characters" })
  }

  const existing = await db.query.user.findFirst({
    where: and(eq(user.username, clean), ne(user.id, session.user.id)),
    columns: { id: true },
  })

  return NextResponse.json({ available: !existing, username: clean, error: null })
}
