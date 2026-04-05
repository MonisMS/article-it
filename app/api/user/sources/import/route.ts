import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { rssSources, rssSourceTopics, userTopics, topics } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const maxDuration = 60

// Parse OPML XML and extract feed entries with optional folder/category context
function parseOpml(xml: string): { name: string; url: string; folder?: string }[] {
  const feeds: { name: string; url: string; folder?: string }[] = []

  // Extract all outline elements — handle both flat and folder-nested structures
  // Folder: <outline text="JavaScript"> ... <outline xmlUrl="..." /> ... </outline>
  // Flat:   <outline xmlUrl="..." text="..." />
  const folderRegex = /<outline[^>]+text="([^"]*)"[^>]*(?!\/)>([^]*?)<\/outline>/gi
  const feedRegex = /<outline[^>]+xmlUrl="([^"]+)"[^>]*text="([^"]*)"/gi

  // First pass: extract feeds inside folder outlines
  let folderMatch
  const processedUrls = new Set<string>()

  while ((folderMatch = folderRegex.exec(xml)) !== null) {
    const folder = folderMatch[1]
    const inner = folderMatch[2]
    let feedMatch
    const innerFeedRegex = /<outline[^>]+xmlUrl="([^"]+)"[^>]*text="([^"]*)"/gi
    while ((feedMatch = innerFeedRegex.exec(inner)) !== null) {
      const url = feedMatch[1].trim()
      if (url && !processedUrls.has(url)) {
        processedUrls.add(url)
        feeds.push({ name: feedMatch[2] || url, url, folder })
      }
    }
  }

  // Second pass: extract top-level feeds (not in a folder)
  let feedMatch
  while ((feedMatch = feedRegex.exec(xml)) !== null) {
    const url = feedMatch[1].trim()
    if (url && !processedUrls.has(url)) {
      processedUrls.add(url)
      feeds.push({ name: feedMatch[2] || url, url })
    }
  }

  return feeds
}

// Fuzzy match folder name to a topic slug
function matchFolderToTopicSlug(folder: string, topicSlugs: string[]): string | null {
  const normalized = folder.toLowerCase().replace(/[^a-z0-9]/g, "")
  for (const slug of topicSlugs) {
    const normalizedSlug = slug.replace(/-/g, "")
    if (
      normalizedSlug === normalized ||
      normalizedSlug.includes(normalized) ||
      normalized.includes(normalizedSlug)
    ) {
      return slug
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file || typeof file === "string") {
      return NextResponse.json({ data: null, error: "No file provided" }, { status: 400 })
    }

    const xml = await (file as File).text()
    if (!xml.includes("opml") && !xml.includes("outline")) {
      return NextResponse.json({ data: null, error: "Invalid OPML file" }, { status: 400 })
    }

    const feeds = parseOpml(xml)
    if (feeds.length === 0) {
      return NextResponse.json({ data: null, error: "No feeds found in OPML file" }, { status: 400 })
    }

    // Get user's followed topics
    const followed = await db.query.userTopics.findMany({
      where: eq(userTopics.userId, session.user.id),
      with: { topic: { columns: { id: true, slug: true, name: true } } },
    })

    if (followed.length === 0) {
      return NextResponse.json({ data: null, error: "Follow at least one topic before importing feeds" }, { status: 400 })
    }

    const userTopicList = followed.map((f) => f.topic)
    const topicSlugs = userTopicList.map((t) => t.slug)
    const fallbackTopicId = userTopicList[0].id

    // Upsert all feed sources (skip existing by URL)
    let imported = 0
    let matched = 0
    let unmatched = 0

    for (const feed of feeds) {
      // Upsert source
      const [existing] = await db
        .select({ id: rssSources.id })
        .from(rssSources)
        .where(eq(rssSources.url, feed.url))
        .limit(1)

      let sourceId: string

      if (existing) {
        sourceId = existing.id
      } else {
        const newId = createId()
        await db.insert(rssSources).values({
          id: newId,
          name: feed.name.slice(0, 200),
          url: feed.url,
          isActive: true,
          qualityScore: 0.5,
        })
        sourceId = newId
        imported++
      }

      // Determine which topic to assign to
      let topicId: string
      if (feed.folder) {
        const matchedSlug = matchFolderToTopicSlug(feed.folder, topicSlugs)
        if (matchedSlug) {
          topicId = userTopicList.find((t) => t.slug === matchedSlug)!.id
          matched++
        } else {
          topicId = fallbackTopicId
          unmatched++
        }
      } else {
        topicId = fallbackTopicId
        unmatched++
      }

      // Link source → topic (ignore if already linked)
      await db
        .insert(rssSourceTopics)
        .values({ sourceId, topicId })
        .onConflictDoNothing()
    }

    return NextResponse.json({
      data: {
        total: feeds.length,
        imported,
        matched,
        unmatched,
        fallbackTopic: userTopicList[0].name,
      },
      error: null,
    })
  } catch (e) {
    console.error("[opml-import]", e)
    return NextResponse.json({ data: null, error: "Failed to import OPML" }, { status: 500 })
  }
}
