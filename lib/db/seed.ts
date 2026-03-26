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
  { name: "Investopedia",           url: "https://www.investopedia.com/news/rss.aspx",              topics: ["finance"] },
  { name: "MarketWatch Top Stories",url: "https://feeds.marketwatch.com/marketwatch/topstories/",   topics: ["finance", "startups"] },
  { name: "Yahoo Finance",          url: "https://finance.yahoo.com/news/rssindex",                 topics: ["finance"] },
  { name: "Reuters Business",       url: "https://feeds.reuters.com/reuters/businessNews",          topics: ["finance", "startups"] },
  // Marketing
  { name: "Moz Blog",               url: "https://moz.com/blog/feed",                              topics: ["marketing"] },
  { name: "Neil Patel Blog",        url: "https://neilpatel.com/blog/feed/",                       topics: ["marketing", "startups"] },
  { name: "HubSpot Marketing Blog", url: "https://blog.hubspot.com/marketing/rss.xml",             topics: ["marketing"] },
  { name: "Search Engine Journal",  url: "https://www.searchenginejournal.com/feed/",              topics: ["marketing"] },
  { name: "Ahrefs Blog",            url: "https://ahrefs.com/blog/rss",                            topics: ["marketing"] },
  // Product
  { name: "Product Hunt",           url: "https://www.producthunt.com/feed",                       topics: ["product", "startups"] },
  { name: "Lenny's Newsletter",     url: "https://www.lennysnewsletter.com/feed",                  topics: ["product", "startups"] },
  { name: "Mind the Product",       url: "https://www.mindtheproduct.com/feed/",                   topics: ["product"] },
  { name: "First Round Review",     url: "https://review.firstround.com/feed.xml",                 topics: ["product", "startups"] },
  // Science
  { name: "NASA News",              url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",         topics: ["science"] },
  { name: "New Scientist",          url: "https://www.newscientist.com/feed/home/",                topics: ["science"] },
  { name: "Science Daily",          url: "https://www.sciencedaily.com/rss/all.xml",               topics: ["science"] },
  { name: "Ars Technica Science",   url: "https://feeds.arstechnica.com/arstechnica/science",      topics: ["science", "ai-ml"] },
  // Design
  { name: "Nielsen Norman Group",   url: "https://www.nngroup.com/feed/rss/",                      topics: ["design", "product"] },
  { name: "Figma Blog",             url: "https://www.figma.com/blog/rss/",                        topics: ["design"] },
  // DevOps
  { name: "Kubernetes Blog",        url: "https://kubernetes.io/feed.xml",                         topics: ["devops", "open-source"] },
  { name: "InfoQ",                  url: "https://www.infoq.com/feed/",                            topics: ["devops", "javascript", "ai-ml"] },
  // Open Source
  { name: "GitHub Blog",            url: "https://github.blog/feed/",                              topics: ["open-source", "devops", "ai-ml"] },
  { name: "Linux Foundation",       url: "https://www.linuxfoundation.org/feed/",                  topics: ["open-source", "devops"] },
  { name: "Opensource.com",         url: "https://opensource.com/feed",                            topics: ["open-source"] },
  // AI (more)
  { name: "DeepMind Blog",          url: "https://deepmind.google/blog/rss.xml",                   topics: ["ai-ml", "science"] },
  { name: "OpenAI News",            url: "https://openai.com/blog/rss.xml",                        topics: ["ai-ml", "startups"] },
  { name: "Towards Data Science",   url: "https://towardsdatascience.com/feed",                    topics: ["ai-ml"] },
  // React / JS (more)
  { name: "Kent C. Dodds",          url: "https://kentcdodds.com/blog/rss.xml",                    topics: ["react", "javascript"] },
  { name: "web.dev",                url: "https://web.dev/feeds/all.xml",                          topics: ["javascript", "react"] },
  { name: "Total TypeScript",       url: "https://www.totaltypescript.com/rss.xml",                topics: ["javascript", "react"] },
  // Startups (more)
  { name: "Fast Company",           url: "https://www.fastcompany.com/feed",                       topics: ["startups", "product", "design"] },
  { name: "Inc. Magazine",          url: "https://www.inc.com/rss/",                               topics: ["startups", "marketing"] },

  // ── Reddit ────────────────────────────────────────────────────────────────
  // Public RSS feeds, no auth. Using top.rss?t=day for quality pre-filtering.
  { name: "Reddit r/programming",       url: "https://www.reddit.com/r/programming/top.rss?t=day",     topics: ["javascript", "devops", "open-source"] },
  { name: "Reddit r/javascript",        url: "https://www.reddit.com/r/javascript/top.rss?t=day",      topics: ["javascript"] },
  { name: "Reddit r/MachineLearning",   url: "https://www.reddit.com/r/MachineLearning/top.rss?t=day", topics: ["ai-ml", "science"] },
  { name: "Reddit r/Python",            url: "https://www.reddit.com/r/Python/top.rss?t=day",          topics: ["ai-ml", "open-source"] },
  { name: "Reddit r/devops",            url: "https://www.reddit.com/r/devops/top.rss?t=day",          topics: ["devops"] },
  { name: "Reddit r/netsec",            url: "https://www.reddit.com/r/netsec/top.rss?t=day",          topics: ["cybersecurity"] },
  { name: "Reddit r/startups",          url: "https://www.reddit.com/r/startups/top.rss?t=day",        topics: ["startups"] },
  { name: "Reddit r/investing",         url: "https://www.reddit.com/r/investing/top.rss?t=day",       topics: ["finance"] },
  { name: "Reddit r/science",           url: "https://www.reddit.com/r/science/top.rss?t=day",         topics: ["science"] },
  { name: "Reddit r/webdev",            url: "https://www.reddit.com/r/webdev/top.rss?t=day",          topics: ["javascript", "react", "design"] },

  // ── YouTube ───────────────────────────────────────────────────────────────
  // Atom feeds via youtube.com/feeds/videos.xml?channel_id=...
  // Thumbnails are extracted from media:group (handled in lib/ingestion.ts).
  { name: "YouTube – Fireship",           url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCsBjURrPoezykLs9EqgamOA", topics: ["javascript", "react"] },
  { name: "YouTube – Theo",               url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCqr-7GDVTsdNBCeufvERYuw", topics: ["javascript", "react"] },
  { name: "YouTube – ThePrimeagen",       url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC8ENHE5xdFSwx71u3fDH5Xw", topics: ["javascript", "open-source"] },
  { name: "YouTube – Traversy Media",     url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC29ju8bIPH5as8OGnQzwJyA", topics: ["javascript", "react"] },
  { name: "YouTube – Web Dev Simplified", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCFbNIlppjAuEX4znoulh0Cw", topics: ["javascript", "react"] },
  { name: "YouTube – Kevin Powell",       url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCJZv4d5rbIKd4QHMPkcABCw", topics: ["design", "javascript"] },
  { name: "YouTube – Two Minute Papers",  url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg", topics: ["ai-ml", "science"] },
  { name: "YouTube – Yannic Kilcher",     url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCZHmQk67mSJgfCCTn7xBfew", topics: ["ai-ml"] },
  { name: "YouTube – TechWorld w/ Nana",  url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCdngmbVKX1Tgre699-XLlUA", topics: ["devops"] },
  { name: "YouTube – John Hammond",       url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCVeW9qkBjo3zosnqUbG7CFw", topics: ["cybersecurity"] },
  { name: "YouTube – Veritasium",         url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCHnyfMqiRRG1u-2MsSQLbXA", topics: ["science"] },
  { name: "YouTube – Kurzgesagt",         url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCsXVk37bltHxD1rDPwtNM8Q", topics: ["science"] },
  { name: "YouTube – Plain Bagel",        url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCFCEuCsyWP0YkP3CZ3Mr01Q", topics: ["finance"] },

  // ── Hacker News extras ────────────────────────────────────────────────────
  // Via hnrss.org (wraps Algolia HN API as RSS). Already have /frontpage.
  { name: "HN Best",     url: "https://hnrss.org/best",              topics: ["startups", "open-source", "ai-ml"] },
  { name: "HN Show HN",  url: "https://hnrss.org/show?points=50",    topics: ["startups", "open-source", "javascript"] },
  { name: "HN Ask HN",   url: "https://hnrss.org/ask?points=30",     topics: ["startups", "product"] },
  { name: "HN Launches", url: "https://hnrss.org/launches",          topics: ["startups", "product"] },

  // ── Medium publications ───────────────────────────────────────────────────
  // Using curated publication feeds rather than raw tag feeds for quality.
  { name: "JavaScript in Plain English", url: "https://javascript.plainenglish.io/feed",       topics: ["javascript", "react"] },
  { name: "AI in Plain English",         url: "https://ai.plainenglish.io/feed",               topics: ["ai-ml"] },
  { name: "Python in Plain English",     url: "https://python.plainenglish.io/feed",           topics: ["ai-ml", "open-source"] },
  { name: "The Startup (Medium)",        url: "https://medium.com/feed/the-startup",           topics: ["startups", "product"] },
  { name: "SWLH (Medium)",               url: "https://medium.com/feed/swlh",                  topics: ["startups", "marketing"] },
  { name: "UX Planet",                   url: "https://medium.com/feed/ux-planet",             topics: ["design", "product"] },
  { name: "Google Cloud Blog (Medium)",  url: "https://medium.com/feed/google-cloud",          topics: ["devops", "open-source"] },
  { name: "Analytics Vidhya",            url: "https://medium.com/feed/analytics-vidhya",      topics: ["ai-ml"] },
  { name: "DataDrivenInvestor",          url: "https://medium.com/feed/datadriveninvestor",    topics: ["finance", "startups"] },
  { name: "Medium Cybersecurity",        url: "https://medium.com/feed/tag/cybersecurity",     topics: ["cybersecurity"] },

  // ── Substack newsletters ──────────────────────────────────────────────────
  { name: "The Pragmatic Engineer",  url: "https://newsletter.pragmaticengineer.com/feed",    topics: ["devops", "startups", "javascript"] },
  { name: "ByteByteGo Newsletter",   url: "https://blog.bytebytego.com/feed",                 topics: ["devops", "javascript", "startups"] },
  { name: "This Week In React",      url: "https://substack.thisweekinreact.com/feed",        topics: ["react", "javascript"] },
  { name: "AlphaSignal AI",          url: "https://alphasignal.substack.com/feed",            topics: ["ai-ml"] },
  { name: "Decoding ML",             url: "https://decodingml.substack.com/feed",             topics: ["ai-ml"] },
  { name: "Exponential View",        url: "https://exponentialview.co/feed",                  topics: ["ai-ml", "startups"] },
  { name: "Noahpinion",              url: "https://noahpinion.blog/feed",                     topics: ["finance", "startups"] },
  { name: "DevOps Bulletin",         url: "https://devopsbulletin.substack.com/feed",         topics: ["devops"] },
  { name: "Growth Unhinged",         url: "https://www.growthunhinged.com/feed",              topics: ["product", "marketing"] },
  { name: "Not Boring",              url: "https://www.notboring.co/feed",                    topics: ["startups"] },

  // ── Dev.to tag feeds ──────────────────────────────────────────────────────
  // Topic-specific feeds alongside the existing global dev.to/feed.
  { name: "Dev.to JavaScript", url: "https://dev.to/feed/tag/javascript",     topics: ["javascript"] },
  { name: "Dev.to React",      url: "https://dev.to/feed/tag/react",          topics: ["react", "javascript"] },
  { name: "Dev.to AI/ML",      url: "https://dev.to/feed/tag/machinelearning", topics: ["ai-ml"] },
  { name: "Dev.to DevOps",     url: "https://dev.to/feed/tag/devops",         topics: ["devops"] },
  { name: "Dev.to Python",     url: "https://dev.to/feed/tag/python",         topics: ["ai-ml", "open-source"] },

  // ── Lobste.rs ─────────────────────────────────────────────────────────────
  // Invite-only link aggregator — high signal-to-noise ratio.
  { name: "Lobste.rs JavaScript", url: "https://lobste.rs/t/javascript.rss", topics: ["javascript", "react"] },
  { name: "Lobste.rs AI",         url: "https://lobste.rs/t/ai.rss",         topics: ["ai-ml"] },
  { name: "Lobste.rs Security",   url: "https://lobste.rs/t/security.rss",   topics: ["cybersecurity"] },
  { name: "Lobste.rs DevOps",     url: "https://lobste.rs/t/devops.rss",     topics: ["devops", "open-source"] },
  { name: "Lobste.rs Python",     url: "https://lobste.rs/t/python.rss",     topics: ["ai-ml", "open-source"] },

  // ── TLDR Newsletter ───────────────────────────────────────────────────────
  // Daily curated digest per topic — each feed item = one day's newsletter.
  { name: "TLDR AI",       url: "https://tldr.tech/api/rss/ai",       topics: ["ai-ml"] },
  { name: "TLDR Dev",      url: "https://tldr.tech/api/rss/dev",      topics: ["javascript", "react", "devops"] },
  { name: "TLDR DevOps",   url: "https://tldr.tech/api/rss/devops",   topics: ["devops"] },
  { name: "TLDR InfoSec",  url: "https://tldr.tech/api/rss/infosec",  topics: ["cybersecurity"] },
  { name: "TLDR Tech",     url: "https://tldr.tech/api/rss/tech",     topics: ["startups", "ai-ml"] },
  { name: "TLDR Founders", url: "https://tldr.tech/api/rss/founders", topics: ["startups", "product"] },
  { name: "TLDR Marketing",url: "https://tldr.tech/api/rss/marketing",topics: ["marketing"] },

  // ── Changelog ─────────────────────────────────────────────────────────────
  { name: "Changelog News",       url: "https://changelog.com/news/feed",         topics: ["javascript", "open-source", "devops", "startups"] },
  { name: "JS Party (Changelog)", url: "https://changelog.com/jsparty/feed",      topics: ["javascript", "react"] },
  { name: "Ship It (Changelog)",  url: "https://changelog.com/shipit/feed",       topics: ["devops"] },
  { name: "Practical AI",         url: "https://changelog.com/practicalai/feed",  topics: ["ai-ml"] },

  // ── GitHub Releases ───────────────────────────────────────────────────────
  // Atom feeds for key OSS repos. Format: github.com/{owner}/{repo}/releases.atom
  // Tagged to relevant topics so they surface in existing user feeds automatically.
  // JS / React ecosystem
  { name: "Releases – React",       url: "https://github.com/facebook/react/releases.atom",           topics: ["react", "javascript"] },
  { name: "Releases – Next.js",     url: "https://github.com/vercel/next.js/releases.atom",           topics: ["react", "javascript"] },
  { name: "Releases – TypeScript",  url: "https://github.com/microsoft/TypeScript/releases.atom",     topics: ["javascript"] },
  { name: "Releases – Vite",        url: "https://github.com/vitejs/vite/releases.atom",              topics: ["javascript"] },
  { name: "Releases – Tailwind CSS",url: "https://github.com/tailwindlabs/tailwindcss/releases.atom", topics: ["javascript", "design"] },
  { name: "Releases – Drizzle ORM", url: "https://github.com/drizzle-team/drizzle-orm/releases.atom", topics: ["javascript", "open-source"] },
  { name: "Releases – ESLint",      url: "https://github.com/eslint/eslint/releases.atom",            topics: ["javascript"] },
  // Runtimes
  { name: "Releases – Node.js",     url: "https://github.com/nodejs/node/releases.atom",              topics: ["javascript", "open-source"] },
  { name: "Releases – Bun",         url: "https://github.com/oven-sh/bun/releases.atom",              topics: ["javascript", "open-source"] },
  { name: "Releases – Deno",        url: "https://github.com/denoland/deno/releases.atom",            topics: ["javascript", "open-source"] },
  // AI / ML
  { name: "Releases – Ollama",      url: "https://github.com/ollama/ollama/releases.atom",            topics: ["ai-ml", "open-source"] },
  { name: "Releases – LangChain",   url: "https://github.com/langchain-ai/langchain/releases.atom",   topics: ["ai-ml"] },
  // DevOps
  { name: "Releases – Docker Compose", url: "https://github.com/docker/compose/releases.atom",        topics: ["devops", "open-source"] },
  { name: "Releases – Kubernetes",  url: "https://github.com/kubernetes/kubernetes/releases.atom",    topics: ["devops", "open-source"] },
  { name: "Releases – Terraform",   url: "https://github.com/hashicorp/terraform/releases.atom",      topics: ["devops", "open-source"] },
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
