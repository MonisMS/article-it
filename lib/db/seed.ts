import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { createId } from "@paralleldrive/cuid2"
import * as schema from "./schema"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

// ─── Topics ───────────────────────────────────────────────────────────────────

const TOPICS = [
  { name: "React",         slug: "react",          icon: "⚛️",  description: "React, Next.js, and the modern component ecosystem." },
  { name: "JavaScript",   slug: "javascript",     icon: "🟨",  description: "JS news, specs, patterns, and tooling." },
  { name: "AI & ML",      slug: "ai-ml",          icon: "🤖",  description: "Machine learning, LLMs, and AI research." },
  { name: "Startups",     slug: "startups",       icon: "🚀",  description: "Startup news, founder stories, and venture capital." },
  { name: "Cybersecurity",slug: "cybersecurity",  icon: "🛡️",  description: "Security research, breaches, and best practices." },
  { name: "Finance",      slug: "finance",        icon: "📈",  description: "Markets, personal finance, and fintech." },
  { name: "Design",       slug: "design",         icon: "🎨",  description: "UI/UX, visual design, and design systems." },
  { name: "DevOps",       slug: "devops",         icon: "☁️",  description: "CI/CD, infrastructure, Docker, and Kubernetes." },
  { name: "Product",      slug: "product",        icon: "📱",  description: "Product management, strategy, and growth." },
  { name: "Science",      slug: "science",        icon: "🧬",  description: "Breakthroughs across biology, physics, and space." },
  { name: "Marketing",    slug: "marketing",      icon: "💼",  description: "Growth, SEO, content, and brand strategy." },
  { name: "Open Source",  slug: "open-source",    icon: "🌍",  description: "OSS projects, releases, and community." },
]

// ─── RSS Sources ──────────────────────────────────────────────────────────────
// Each entry: { name, url, topics: slug[] }

const SOURCES = [
  // React / JS
  { name: "CSS-Tricks",         url: "https://css-tricks.com/feed/",                      topics: ["react", "javascript", "design"] },
  { name: "Overreacted",        url: "https://overreacted.io/rss.xml",                    topics: ["react", "javascript"] },
  { name: "Dev.to",             url: "https://dev.to/feed",                               topics: ["react", "javascript", "devops", "open-source"] },
  { name: "Smashing Magazine",  url: "https://www.smashingmagazine.com/feed/",            topics: ["design", "javascript", "react"] },
  { name: "2ality",             url: "https://2ality.com/feeds/posts.atom",               topics: ["javascript"] },
  { name: "Josh W Comeau",      url: "https://www.joshwcomeau.com/rss.xml",               topics: ["react", "javascript", "design"] },
  // AI / ML
  { name: "Hugging Face Blog",  url: "https://huggingface.co/blog/feed.xml",              topics: ["ai-ml", "open-source"] },
  { name: "Google AI Blog",     url: "https://blog.google/technology/ai/rss/",            topics: ["ai-ml", "science"] },
  { name: "MIT Tech Review AI", url: "https://www.technologyreview.com/feed/",            topics: ["ai-ml", "science", "startups"] },
  // Startups / Tech
  { name: "TechCrunch",         url: "https://techcrunch.com/feed/",                      topics: ["startups", "ai-ml", "finance"] },
  { name: "Hacker News Front",  url: "https://hnrss.org/frontpage",                       topics: ["startups", "javascript", "open-source", "ai-ml"] },
  { name: "The Verge",          url: "https://www.theverge.com/rss/index.xml",            topics: ["startups", "science", "product"] },
  // Cybersecurity
  { name: "Krebs on Security",  url: "https://krebsonsecurity.com/feed/",                 topics: ["cybersecurity"] },
  { name: "The Hacker News",    url: "https://feeds.feedburner.com/TheHackersNews",       topics: ["cybersecurity"] },
  { name: "Schneier on Security",url: "https://www.schneier.com/feed/atom/",              topics: ["cybersecurity"] },
  // Design
  { name: "A List Apart",       url: "https://alistapart.com/main/feed/",                 topics: ["design", "javascript"] },
  { name: "UX Collective",      url: "https://uxdesign.cc/feed",                          topics: ["design", "product"] },
  // DevOps
  { name: "Martin Fowler",      url: "https://martinfowler.com/feed.atom",                topics: ["devops", "open-source", "javascript"] },
  { name: "The New Stack",      url: "https://thenewstack.io/feed/",                      topics: ["devops", "open-source", "startups"] },
  // Finance
  { name: "Investopedia",       url: "https://www.investopedia.com/news/rss.aspx",                topics: ["finance"] },
  // Marketing
  { name: "Moz Blog",           url: "https://moz.com/blog/feed",                         topics: ["marketing"] },
  { name: "Neil Patel Blog",    url: "https://neilpatel.com/blog/feed/",                  topics: ["marketing", "startups"] },
  // Product
  { name: "Product Hunt",       url: "https://www.producthunt.com/feed",                  topics: ["product", "startups"] },
  { name: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/feed",             topics: ["product", "startups"] },
  // Science
  { name: "NASA News",          url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",    topics: ["science"] },
  { name: "New Scientist",      url: "https://www.newscientist.com/feed/home/",           topics: ["science"] },
  // Open Source
  { name: "GitHub Blog",        url: "https://github.blog/feed/",                         topics: ["open-source", "devops", "ai-ml"] },
  { name: "Linux Foundation",   url: "https://www.linuxfoundation.org/feed/",            topics: ["open-source", "devops"] },
]

async function seed() {
  console.log("🌱 Seeding topics...")

  // Insert topics (skip if already exists via slug unique constraint)
  const topicRecords = await Promise.all(
    TOPICS.map((t) =>
      db
        .insert(schema.topics)
        .values({ id: createId(), ...t })
        .onConflictDoNothing()
        .returning()
    )
  )

  // Build slug → id map (fetch from DB to cover already-existing rows)
  const allTopics = await db.query.topics.findMany()
  const topicMap = Object.fromEntries(allTopics.map((t) => [t.slug, t.id]))

  console.log(`✓ ${allTopics.length} topics ready`)
  console.log("🌱 Seeding RSS sources...")

  for (const src of SOURCES) {
    // Insert source
    const [source] = await db
      .insert(schema.rssSources)
      .values({ id: createId(), name: src.name, url: src.url })
      .onConflictDoNothing()
      .returning()

    // Get the source id (whether just inserted or already existed)
    const existing = source ?? (await db.query.rssSources.findFirst({
      where: (s, { eq }) => eq(s.url, src.url),
    }))

    if (!existing) continue

    // Link source → topics
    for (const slug of src.topics) {
      const topicId = topicMap[slug]
      if (!topicId) continue
      await db
        .insert(schema.rssSourceTopics)
        .values({ sourceId: existing.id, topicId })
        .onConflictDoNothing()
    }
  }

  const sourceCount = await db.query.rssSources.findMany()
  console.log(`✓ ${sourceCount.length} sources ready`)
  console.log("✅ Seed complete")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
