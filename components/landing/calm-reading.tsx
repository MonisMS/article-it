"use client"

import { motion } from "framer-motion"

const SOURCE_TYPES = [
  { label: "Tech Blogs & RSS", examples: "OpenAI, Vercel, GitHub, Stripe" },
  { label: "Hacker News", examples: "Top links, Show HN, Ask HN" },
  { label: "Reddit Communities", examples: "r/programming, r/MachineLearning, r/startups" },
  { label: "YouTube Channels", examples: "Fireship, Theo, ThePrimeagen" },
  { label: "Substack Newsletters", examples: "Lenny's, TLDR, The Pragmatic Engineer" },
  { label: "GitHub Releases", examples: "New versions, changelogs, announcements" },
]

export function CalmReading() {
  return (
    <section className="bg-app-bg px-4 sm:px-6 py-24">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-app-text-subtle">
            What&apos;s inside a topic
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
            Every corner of the internet, for the thing you care about.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-app-text-muted">
            When you follow a topic, Curio aggregates from every format — not just blog posts.
            Reddit threads, YouTube videos, newsletters, GitHub releases — all ranked and waiting.
          </p>

          <div className="mt-8 flex items-center gap-3 text-sm text-app-text-muted">
            <span className="h-2 w-2 rounded-full bg-app-accent shrink-0" />
            No manual source hunting. Ever.
          </div>
        </div>

        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="rounded-4xl bg-app-surface shadow-md shadow-black/10 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-app-text">Sources inside <span className="text-app-accent">AI</span></p>
              <span className="text-xs text-app-text-subtle">Updated daily</span>
            </div>

            <div className="grid gap-3">
              {SOURCE_TYPES.map(({ label, examples }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 rounded-2xl bg-app-surface-hover px-4 py-3"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-app-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-app-text">{label}</p>
                    <p className="mt-0.5 text-xs text-app-text-subtle truncate">{examples}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-app-border pt-4 flex items-center justify-between text-xs text-app-text-subtle">
              <span>All 26 topics work the same way</span>
              <span className="font-semibold text-app-accent">275+ sources total</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
