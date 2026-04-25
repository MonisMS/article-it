"use client"

import { motion } from "framer-motion"
import { Bookmark, Clock, Mail, Sparkles } from "lucide-react"
import { LandingArticleCard, type LandingArticleCardData } from "@/components/landing/landing-article-card"

const STEPS = [
  {
    icon: Sparkles,
    step: "01",
    title: "Choose what you care about",
    description: "Pick a few topics. Curio stays quiet — and only pulls from sources that match your interests.",
  },
  {
    icon: Bookmark,
    step: "02",
    title: "Get a curated feed",
    description: "A clean, editorial layout with context (source, time, read length) so you can decide fast.",
  },
  {
    icon: Mail,
    step: "03",
    title: "Read on your schedule",
    description: "Browse anytime, or set an email digest. No spam — just the best articles, at the time you choose.",
  },
]

const PREVIEW_ARTICLES: LandingArticleCardData[] = [
  {
    topic: "Product",
    title: "How to stay informed without losing your afternoon",
    description: "A short, practical guide to staying current with less scrolling and more reading.",
    source: "The Editorial",
    published: "Today",
    readTime: "4 min",
  },
  {
    topic: "AI",
    title: "What model providers aren't telling you about benchmarks",
    description: "The gap between lab scores and production reality — and how to close it.",
    source: "Inference Weekly",
    published: "Yesterday",
    readTime: "5 min",
  },
  {
    topic: "Engineering",
    title: "A weekly reading system that actually sticks",
    description: "A lightweight workflow: save, skim, read, and close the loop.",
    source: "Field Guide",
    published: "2d ago",
    readTime: "6 min",
  },
]

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-app-surface shadow-sm shadow-black/5 p-5">
      <div className="flex items-center justify-between text-[11px] text-app-text-subtle">
        <span className="font-semibold tracking-wide uppercase">Preview</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Calm mode
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-app-bg py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-widest uppercase text-app-text-subtle mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
            Start in minutes. Stay focused daily.
          </h2>
          <p className="mt-3 text-[15px] text-app-text-muted max-w-2xl mx-auto leading-relaxed">
            A simple flow designed for reading — not for feeding an algorithm.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {STEPS.map(({ icon: Icon, step, title, description }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-4xl bg-app-surface shadow-sm shadow-black/5 p-8 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-app-accent-light">
                  <Icon className="w-5 h-5 text-app-accent" />
                </div>
                <span className="text-4xl font-semibold text-app-text-subtle/60 select-none tabular-nums">
                  {step}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-app-text mb-2">{title}</h3>
                <p className="text-sm text-app-text-muted leading-relaxed">{description}</p>
              </div>

              {step === "01" && (
                <PreviewFrame>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {["AI", "React", "Startups", "Design", "Security", "DevOps", "Cloud"].map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-app-surface-hover px-3 py-1.5 text-xs font-semibold text-app-text-muted shadow-xs shadow-black/5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="border-t border-app-border pt-3 flex items-center justify-between text-xs">
                      <span className="text-app-text-subtle">211 curated sources</span>
                      <span className="font-semibold text-app-accent">Updated daily</span>
                    </div>
                    <LandingArticleCard article={PREVIEW_ARTICLES[0]} />
                  </div>
                </PreviewFrame>
              )}

              {step === "02" && (
                <PreviewFrame>
                  <div className="grid gap-3">
                    <LandingArticleCard article={PREVIEW_ARTICLES[1]} />
                    <LandingArticleCard article={PREVIEW_ARTICLES[2]} />
                  </div>
                </PreviewFrame>
              )}

              {step === "03" && (
                <PreviewFrame>
                  <div className="rounded-3xl bg-app-surface-hover p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-app-text">Email digest</p>
                      <span className="text-xs text-app-text-subtle">Weekly</span>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {[
                        { k: "Day", v: "Sunday" },
                        { k: "Time", v: "9:00" },
                        { k: "Timezone", v: "Local" },
                      ].map((x) => (
                        <div key={x.k} className="flex items-center justify-between text-sm">
                          <span className="text-app-text-muted">{x.k}</span>
                          <span className="font-semibold text-app-text">{x.v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5">
                      <LandingArticleCard article={PREVIEW_ARTICLES[0]} />
                    </div>
                  </div>
                </PreviewFrame>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
