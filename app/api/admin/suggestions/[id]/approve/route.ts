import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { topicSuggestions, topics } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { slugify } from "@/lib/utils"

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

  const suggestion = await db.query.topicSuggestions.findFirst({
    where: eq(topicSuggestions.id, id),
  })
  if (!suggestion) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 })
  }
  if (suggestion.status !== "pending") {
    return NextResponse.json({ data: null, error: "Already reviewed" }, { status: 409 })
  }

  const slug = slugify(suggestion.name)

  try {
    const [topic] = await db
      .insert(topics)
      .values({ id: createId(), name: suggestion.name, slug, description: suggestion.description })
      .returning()

    await db
      .update(topicSuggestions)
      .set({ status: "approved" })
      .where(eq(topicSuggestions.id, id))

    return NextResponse.json({ data: { topic }, error: null })
  } catch {
    return NextResponse.json(
      { data: null, error: `A topic with slug "${slug}" already exists. Rename it in the Topics tab first.` },
      { status: 409 }
    )
  }
}
