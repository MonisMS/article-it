import type { MetadataRoute } from "next"
import { db } from "@/lib/db"
import { topics } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const revalidate = 3600 // regenerate every hour

const SEO_PAGES = [
  "pocket-alternative",
  "feedly-alternative",
  "mailbrew-alternative",
  "personalized-email-digest",
  "rss-reader-email",
  "readwise-alternative",
  "inoreader-alternative",
  "stay-informed",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://articleit.com"

  const allTopics = await db
    .select({ slug: topics.slug })
    .from(topics)
    .where(eq(topics.isActive, true))

  const topicUrls: MetadataRoute.Sitemap = allTopics.map((t) => ({
    url: `${base}/topics/${t.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }))

  const seoUrls: MetadataRoute.Sitemap = SEO_PAGES.map((slug) => ({
    url: `${base}/${slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }))

  return [
    { url: base, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/sign-up`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/sign-in`, changeFrequency: "monthly", priority: 0.5 },
    ...seoUrls,
    ...topicUrls,
  ]
}
