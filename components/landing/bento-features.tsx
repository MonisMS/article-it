"use client"

import { motion } from "framer-motion"
import { Bookmark, Mail, ShieldCheck, Sparkles } from "lucide-react"

const FEATURES = [
  {
    icon: Sparkles,
    title: "Curated by design",
    description: "A simple system: topics you choose, sources we vet. No attention bait, no noisy personalization." ,
  },
  {
    icon: Mail,
    title: "Digests, on your time",
    description: "Daily or weekly at the exact hour you want — the best articles, delivered calmly." ,
  },
  {
    icon: Bookmark,
    title: "Save what matters",
    description: "One-click bookmarking and a clean history so you can return when you’re ready." ,
  },
  {
    icon: ShieldCheck,
    title: "Quality-ranked sources",
    description: "A blended ranking that rewards consistently good sources — not clicky headlines." ,
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
            Everything you need — nothing that steals attention.
          </h2>
          <p className="mt-3 text-[15px] text-app-text-muted max-w-2xl mx-auto leading-relaxed">
            A premium reading experience that prioritizes clarity, calmness, and content.
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
