"use client"

import { motion } from "framer-motion"
import { Bookmark, Mail, ShieldCheck, Sparkles } from "lucide-react"

const FEATURES = [
  {
    icon: Sparkles,
    title: "275+ sources, zero tab-switching",
    description: "Blogs, Reddit, YouTube, HN, Substack, GitHub Releases — all pulled into one feed per topic. You pick the topic; we handle the rest.",
  },
  {
    icon: Mail,
    title: "Digest on your schedule",
    description: "Daily or weekly at the exact hour you want — the best articles from all your sources, delivered to your inbox.",
  },
  {
    icon: Bookmark,
    title: "Save and come back",
    description: "One-click bookmarking and a full reading history. Pick up exactly where you left off, across any source or format.",
  },
  {
    icon: ShieldCheck,
    title: "Quality-ranked, not click-ranked",
    description: "Sources earn their rank through real reader signals — bookmarks and reads. No virality bias, no rage-bait bubble.",
  },
]

export function BentoFeatures() {
  return (
    <section id="features" className="bg-app-bg py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-app-text-subtle mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
            Everything about your topic — in one place.
          </h2>
          <p className="mt-3 text-[15px] text-app-text-muted max-w-2xl mx-auto leading-relaxed">
            Stop hopping between Reddit, YouTube, newsletters, and blogs. Curio does the collecting so you can just read.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="group relative rounded-4xl bg-app-surface p-8 shadow-sm shadow-black/5 hover:-translate-y-1 hover:shadow-md hover:shadow-black/10 transition-all"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-app-accent-light mb-6">
                <Icon className="w-5 h-5 text-app-accent" />
              </div>
              <h3 className="text-lg font-semibold text-app-text mb-2">{title}</h3>
              <p className="text-sm text-app-text-muted leading-relaxed">{description}</p>
              <div className="absolute inset-0 rounded-4xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-app-accent/5 to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
