import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { topics } from "@/lib/db/schema"

export async function GET() {
  try {
    const data = await db.query.topics.findMany({
      where: eq(topics.isActive, true),
      orderBy: (t, { asc }) => asc(t.name),
    })
    return NextResponse.json({ data, error: null })
  } catch (err) {
    console.error("[GET /api/topics]", err)
    return NextResponse.json({ data: null, error: "Failed to fetch topics" }, { status: 500 })
  }
}
