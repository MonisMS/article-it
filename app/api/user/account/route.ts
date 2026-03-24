import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user, session as sessionTable, account } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE() {
  const sessionData = await auth.api.getSession({ headers: await headers() })
  if (!sessionData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = sessionData.user.id

  try {
    // Explicitly delete auth-owned tables first so the user row deletion
    // succeeds even if the DB-level cascade constraint was never applied
    // (e.g. pnpm db:push not yet run after schema was updated).
    // Order matters: sessions and accounts reference user, so they go first.
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId))
    await db.delete(account).where(eq(account.userId, userId))
    // Deleting the user row cascades to all product tables (bookmarks,
    // user_topics, digest_schedules, read_articles, etc.)
    await db.delete(user).where(eq(user.id, userId))

    return NextResponse.json({ data: { ok: true }, error: null })
  } catch (e) {
    console.error("[user/account] Delete failed:", e)
    return NextResponse.json({ data: null, error: "Failed to delete account" }, { status: 500 })
  }
}
