"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Check, Globe, Link2, BookOpen } from "lucide-react"

const MOCK_TOPICS = ["AI", "React", "Startups", "Open Source"]

const MOCK_ARTICLES = [
  { title: "How Postgres makes indexing fast", source: "PostgreSQL Blog" },
  { title: "The founder's guide to cold outreach", source: "Lenny's Newsletter" },
  { title: "React 19 — what actually changed", source: "React Blog" },
]

export function ShareFeature() {
  return (
    <section className="bg-app-surface-hover px-4 sm:px-6 py-24">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 items-center">
        {/* Left — copy */}
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-app-text-subtle">
            Public reading lists
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
            Share what you read.
            <span className="block text-app-text-muted">One link, all your topics.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-app-text-muted max-w-md">
            Pick a username and get a public page at <span className="font-medium text-app-text">/p/your-name</span>. Anyone who visits sees your topics and recent highlights — and can follow the same feed with one click.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              "Your own shareable URL — /p/username",
              "Shows your topics + recent article highlights",
              "Visitors can follow your exact setup instantly",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-app-surface px-5 py-3.5 shadow-xs shadow-black/5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app-accent-light">
                  <Check className="h-3 w-3 text-app-accent" strokeWidth={2.5} />
                </span>
                <p className="text-sm text-app-text-muted leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-2xl bg-app-accent px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-black/10 hover:opacity-95 transition-all"
            >
              Claim your reading URL →
            </Link>
          </div>
        </div>

        {/* Right — mock public profile */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="rounded-4xl bg-app-surface shadow-md shadow-black/8 overflow-hidden border border-app-border"
          >
            {/* Mock browser bar */}
            <div className="flex items-center gap-2 border-b border-app-border bg-app-surface-hover px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-app-border-strong" />
                <span className="w-2.5 h-2.5 rounded-full bg-app-border-strong" />
                <span className="w-2.5 h-2.5 rounded-full bg-app-border-strong" />
              </div>
              <div className="flex-1 flex items-center gap-1.5 rounded-md bg-app-surface border border-app-border px-3 py-1">
                <Globe className="h-3 w-3 text-app-text-subtle shrink-0" />
                <span className="text-xs text-app-text-subtle">/p/<span className="text-app-accent font-medium">alex</span></span>
              </div>
              <Link2 className="h-3.5 w-3.5 text-app-text-subtle" />
            </div>

            {/* Mock page content */}
            <div className="p-6 sm:p-8">
              {/* Profile header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-app-accent-light flex items-center justify-center">
                    <span className="text-sm font-bold text-app-accent">AL</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-app-text">Alex's reading list</p>
                    <p className="text-xs text-app-text-subtle">{MOCK_TOPICS.length} topics · curated on Curio</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-semibold text-white">
                  <BookOpen className="h-3 w-3" />
                  Follow these topics
                </span>
              </div>

              {/* Topics */}
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-app-text-subtle mb-2.5">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {MOCK_TOPICS.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-app-border bg-app-surface-hover px-3 py-1.5 text-xs font-medium text-app-text-muted">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent articles */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-app-text-subtle mb-2.5">Recent highlights</p>
                <div className="space-y-2">
                  {MOCK_ARTICLES.map((a) => (
                    <div key={a.title} className="flex items-start gap-3 rounded-xl border border-app-border bg-app-surface-hover px-3 py-2.5">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-app-accent shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-app-text line-clamp-1">{a.title}</p>
                        <p className="text-[10px] text-app-text-subtle mt-0.5">{a.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
