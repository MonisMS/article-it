import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq, and, ne } from "drizzle-orm"
import { slugify } from "@/lib/utils"

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { username, publicProfile } = body as { username?: string; publicProfile?: boolean }

    const updates: Partial<{ username: string | null; publicProfile: boolean }> = {}

    if (typeof publicProfile === "boolean") {
      updates.publicProfile = publicProfile
    }

    if (username !== undefined) {
      if (username === "") {
        updates.username = null
      } else {
        const clean = slugify(username).replace(/\s+/g, "-").slice(0, 30)
        if (!clean) {
          return NextResponse.json({ data: null, error: "Invalid username" }, { status: 400 })
        }
        // Check uniqueness (exclude current user)
        const existing = await db.query.user.findFirst({
          where: and(eq(user.username, clean), ne(user.id, session.user.id)),
          columns: { id: true },
        })
        if (existing) {
          return NextResponse.json({ data: null, error: "Username already taken" }, { status: 409 })
        }
        updates.username = clean
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ data: null, error: "Nothing to update" }, { status: 400 })
    }

    await db.update(user).set(updates).where(eq(user.id, session.user.id))

    return NextResponse.json({ data: updates, error: null })
  } catch (e) {
    console.error("[public-profile]", e)
    return NextResponse.json({ data: null, error: "Failed to update profile" }, { status: 500 })
  }
}
