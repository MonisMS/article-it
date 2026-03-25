"use client"

import { motion } from "framer-motion"
import { Bell, BookOpen, SlidersHorizontal } from "lucide-react"

const STEPS = [
  {
    icon: SlidersHorizontal,
    step: "01",
    title: "Pick your topics",
    description: "Choose from curated topics — React, AI, Startups, Finance, and more. Each topic is powered by hand-picked sources, not an algorithm.",
  },
  {
    icon: BookOpen,
    step: "02",
    title: "We find the articles",
    description: "Our pipeline scans 107+ RSS feeds every few hours and surfaces the most relevant articles for every topic you follow.",
  },
  {
    icon: Bell,
    step: "03",
    title: "Read on your schedule",
    description: "Browse your feed anytime or set a digest — daily or weekly at the time you choose. Your inbox, your rules.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-lp-bg py-28 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-widest uppercase text-lp-accent mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-lp-text">
            Up and reading in 2 minutes.
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-px bg-lp-border rounded-2xl overflow-hidden">
          {STEPS.map(({ icon: Icon, step, title, description }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-lp-surface p-8 flex flex-col gap-5 group hover:bg-lp-elevated transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-lp-accent-muted">
                  <Icon className="w-5 h-5 text-lp-accent" />
                </div>
                <span className="text-4xl font-bold text-lp-border-strong select-none tabular-nums group-hover:text-lp-border transition-colors">
                  {step}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-lp-text mb-2">{title}</h3>
                <p className="text-sm text-lp-text-muted leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
