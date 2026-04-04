import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema/auth"
import { eq } from "drizzle-orm"

export async function POST() {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })
  }
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  await db
    .update(user)
    .set({ lastVisitAt: new Date() })
    .where(eq(user.id, session.user.id))

  return NextResponse.json({ data: null, error: null })
}
