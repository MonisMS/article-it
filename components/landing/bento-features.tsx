"use client"

import { motion } from "framer-motion"
import { Bookmark, Clock, Mail, Rss, Search, Sparkles } from "lucide-react"

const FEATURES = [
  {
    icon: Rss,
    title: "107+ sources, zero setup",
    description: "TechCrunch, Ars Technica, Hacker News, The Verge — we've already curated the best feeds for every topic.",
    size: "lg",
  },
  {
    icon: Mail,
    title: "Digest on your schedule",
    description: "Daily or weekly, at the exact time you choose. JavaScript on Mondays, AI every Sunday.",
    size: "sm",
  },
  {
    icon: Bookmark,
    title: "Save for later",
    description: "One click to bookmark. Come back whenever you have time.",
    size: "sm",
  },
  {
    icon: Search,
    title: "Search across everything",
    description: "Full-text search across every article we've ever ingested.",
    size: "sm",
  },
  {
    icon: Sparkles,
    title: "No algorithm. No noise.",
    description: "You follow topics. We show you articles from those topics. That's it — no engagement optimization, no rage-bait, no sponsored posts.",
    size: "lg",
  },
  {
    icon: Clock,
    title: "Read history",
    description: "Track what you've read. Mark articles done. Keep your feed clean.",
    size: "sm",
  },
]

export function BentoFeatures() {
  return (
    <section className="bg-lp-surface/30 py-28 px-4 sm:px-6 border-t border-lp-border">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-lp-accent mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-lp-text">
            Everything you need. Nothing you don&apos;t.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map(({ icon: Icon, title, description, size }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className={`group relative rounded-2xl border border-lp-border bg-lp-surface p-6 hover:border-lp-border-strong hover:bg-lp-elevated transition-all ${
                size === "lg" ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-lp-accent-muted mb-5">
                <Icon className="w-4.5 h-4.5 text-lp-accent" />
              </div>
              <h3 className="font-semibold text-lp-text mb-2">{title}</h3>
              <p className="text-sm text-lp-text-muted leading-relaxed">{description}</p>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-lp-accent/3 to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
