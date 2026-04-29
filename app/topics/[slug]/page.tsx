import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { topics } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getArticlesByTopicSlug } from "@/lib/db/queries/articles"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { ArrowRight, BookOpen, Rss } from "lucide-react"
import { TopicIcon } from "@/components/topic-icon"

const TOPIC_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-600",
  "from-green-500 to-emerald-600",
  "from-fuchsia-500 to-violet-600",
  "from-sky-500 to-blue-600",
  "from-red-500 to-rose-600",
]

function topicColorIndex(name: string): number {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % TOPIC_GRADIENTS.length
}

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const allTopics = await db
    .select({ slug: topics.slug })
    .from(topics)
    .where(eq(topics.isActive, true))
  return allTopics.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const topic = await db.query.topics.findFirst({ where: eq(topics.slug, slug) })
  if (!topic) return {}

  const title = `${topic.name} Articles — Best ${topic.name} Content`
  const description =
    topic.description ??
    `Discover the best ${topic.name} articles from curated sources. Get a personalized ${topic.name} digest delivered to your inbox.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/topics/${slug}`,
    },
  }
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params
  const { topic, articles } = await getArticlesByTopicSlug(slug, 0)
  if (!topic) notFound()

  const gradient = TOPIC_GRADIENTS[topicColorIndex(topic.name)]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${topic.name} Articles`,
    description:
      topic.description ??
      `The best ${topic.name} articles from curated sources, delivered to your inbox.`,
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://curio-sity.vercel.app"}/topics/${slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Curio",
      url: process.env.NEXT_PUBLIC_APP_URL ?? "https://curio-sity.vercel.app",
    },
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0D1117]">
      <Nav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero */}
        <div className={`relative w-full rounded-2xl mb-10 overflow-hidden bg-gradient-to-br ${gradient}`}>
          <div className="px-8 py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-4">
              <TopicIcon slug={topic.slug} size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white">
              {topic.name} Articles
            </h1>
            {topic.description && (
              <p className="text-white/80 text-sm mt-2 max-w-md leading-relaxed">
                {topic.description}
              </p>
            )}
            <p className="text-white/60 text-xs mt-3">
              Updated daily from curated sources
            </p>
            <Link
              href="/sign-up"
              className="mt-6 inline-flex items-center gap-2 bg-white text-stone-900 font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-stone-100 transition-colors"
            >
              Get {topic.name} digest
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Value prop strip */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: <Rss className="w-4 h-4" />, label: "Curated sources", sub: "Quality-ranked feeds" },
            { icon: <BookOpen className="w-4 h-4" />, label: "Daily updates", sub: "Fresh every morning" },
            { icon: <ArrowRight className="w-4 h-4" />, label: "Email digest", sub: "In your inbox, on schedule" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-4 text-center"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
                {item.icon}
              </span>
              <p className="text-xs font-semibold text-stone-800 dark:text-[#F0EDE6]">{item.label}</p>
              <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Article list */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-semibold text-stone-400 dark:text-[#6B7585] uppercase tracking-widest">
            Recent articles
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-stone-200 dark:from-[#1E2A3A] to-transparent" />
        </div>

        {articles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-stone-400 text-sm">No articles yet — check back soon.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {articles.slice(0, 12).map((article) => (
              <li key={article.id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-4 hover:border-stone-300 dark:hover:border-[#2D3B4F] hover:shadow-sm transition-all"
                >
                  <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                    {article.title}
                  </p>
                  {article.description && (
                    <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-1 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  <p className="text-xs text-stone-300 dark:text-[#4A5568] mt-2">
                    {article.source.name}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-stone-900 to-amber-950 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Get the best {topic.name} content in your inbox
          </h2>
          <p className="text-stone-400 text-sm mb-6 max-w-sm mx-auto">
            Curio curates {topic.name} articles from the web&apos;s best sources and delivers them on your schedule.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors"
          >
            Start free — no card needed
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
