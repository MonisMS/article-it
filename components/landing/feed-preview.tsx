"use client"

import { motion } from "framer-motion"
import { LandingArticleCard, type LandingArticleCardData } from "@/components/landing/landing-article-card"

const FEED: LandingArticleCardData[] = [
  {
    topic: "Startups",
    title: "The quiet advantage: building products that don’t compete for attention",
    description: "A short essay on distribution, focus, and why calmer products often win long-term trust.",
    source: "Signal Journal",
    published: "Today",
    readTime: "6 min",
  },
  {
    topic: "AI",
    title: "What we learned shipping LLM features to real users",
    description: "Practical takeaways on evaluation, UX, and the gap between demos and daily workflows.",
    source: "Paper & Ink",
    published: "2h ago",
    readTime: "8 min",
  },
  {
    topic: "Design",
    title: "Typography that makes reading feel effortless",
    description: "On line length, rhythm, and small decisions that reduce cognitive load.",
    source: "Studio Notes",
    published: "Yesterday",
    readTime: "5 min",
  },
  {
    topic: "Security",
    title: "A beginner-friendly threat model for personal apps",
    description: "Simple, practical steps to tighten auth and avoid the most common pitfalls.",
    source: "Field Guide",
    published: "3d ago",
    readTime: "7 min",
  },
  {
    topic: "React",
    title: "Server Components: patterns that age well",
    description: "A measured look at what’s working in production and what to keep boring on purpose.",
    source: "Craft Weekly",
    published: "1w ago",
    readTime: "9 min",
  },
]

export function FeedPreview() {
  return (
    <section id="feed" className="bg-app-bg px-4 sm:px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-app-text-subtle">
              Your feed
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
              Everything from your topic, ranked and ready.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-app-text-muted">
              Articles from blogs, Reddit, YouTube, newsletters — all in one place. Source and read time at a glance so you always know what you’re clicking into.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-7"
          >
            <LandingArticleCard article={FEED[0]} variant="featured" className="h-full" />
          </motion.div>

          <div className="lg:col-span-5 grid gap-5">
            {[FEED[1], FEED[2]].map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: 0.06 + i * 0.06 }}
              >
                <LandingArticleCard article={a} />
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[FEED[3], FEED[4]].map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: 0.06 + i * 0.06 }}
              >
                <LandingArticleCard article={a} />
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="rounded-3xl bg-app-surface shadow-sm shadow-black/5 p-6"
            >
              <p className="text-sm font-semibold text-app-text">And more…</p>
              <p className="mt-2 text-sm text-app-text-muted leading-relaxed">
                Articles keep flowing in — but the interface stays quiet.
              </p>
              <div className="mt-5 grid gap-2">
                {["Quality-ranked sources", "No ads or rage-bait", "Fast bookmarking"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-app-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-app-accent" />
                    {t}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
