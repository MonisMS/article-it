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
    await db.transaction(async (tx) => {
      // Sessions and accounts reference user via FK — delete them first.
      // All three run in one transaction so a partial failure rolls back cleanly.
      await tx.delete(sessionTable).where(eq(sessionTable.userId, userId))
      await tx.delete(account).where(eq(account.userId, userId))
      await tx.delete(user).where(eq(user.id, userId))
    })

    return NextResponse.json({ data: { ok: true }, error: null })
  } catch (e) {
    console.error("[user/account] Delete failed:", e)
    return NextResponse.json({ data: null, error: "Failed to delete account" }, { status: 500 })
  }
}
