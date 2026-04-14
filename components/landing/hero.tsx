"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LandingArticleCard, type LandingArticleCardData } from "@/components/landing/landing-article-card"

const HERO_ARTICLES: LandingArticleCardData[] = [
  {
    topic: "AI",
    title: "A practical guide to evaluating LLM features",
    description: "How to keep the magic while still being honest about reliability — without turning your app into a lab.",
    source: "Paper & Ink",
    published: "2h ago",
    readTime: "7 min",
  },
  {
    topic: "Design",
    title: "The quiet craft of readable interfaces",
    description: "Small typographic choices that make long-form reading feel effortless.",
    source: "Studio Notes",
    published: "Yesterday",
    readTime: "5 min",
  },
  {
    topic: "Startups",
    title: "Build for retention without stealing attention",
    description: "A thoughtful alternative to engagement hacks — and why users notice.",
    source: "Signal Journal",
    published: "3d ago",
    readTime: "6 min",
  },
  {
    topic: "React",
    title: "Patterns for Server Components that stay boring",
    description: "What’s working in production, what’s not, and how to keep your codebase calm.",
    source: "Craft Weekly",
    published: "1w ago",
    readTime: "9 min",
  },
]

function FloatingCards() {
  const cards = [
    { a: HERO_ARTICLES[0], className: "absolute left-0 top-8 w-[320px] -rotate-2", delay: 0.15, float: 6 },
    { a: HERO_ARTICLES[1], className: "absolute right-0 top-0 w-[320px] rotate-2", delay: 0.22, float: 7 },
    { a: HERO_ARTICLES[2], className: "absolute left-10 bottom-8 w-[330px] rotate-1", delay: 0.28, float: 5 },
    { a: HERO_ARTICLES[3], className: "absolute right-8 bottom-0 w-[300px] -rotate-1", delay: 0.34, float: 6 },
  ]

  return (
    <div className="relative h-[520px] w-full max-w-[560px]">
      {cards.map(({ a, className, delay, float }) => (
        <motion.div
          key={a.title}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay }}
          className={className}
        >
          <motion.div
            animate={{ y: [0, -float, 0] }}
            transition={{ duration: 6 + delay * 2, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-auto"
          >
            <LandingArticleCard article={a} />
          </motion.div>
        </motion.div>
      ))}

      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 -top-16 h-64 w-64 rounded-full bg-app-accent/10 blur-[60px]" />
        <div className="absolute -right-28 top-10 h-64 w-64 rounded-full bg-app-accent/8 blur-[70px]" />
        <div className="absolute left-24 bottom-0 h-48 w-48 rounded-full bg-app-accent/6 blur-[70px]" />
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-app-bg px-4 sm:px-6 pt-28 pb-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-app-accent/8 blur-[80px]" />
        <div className="absolute right-[-220px] top-[120px] h-[420px] w-[420px] rounded-full bg-app-accent/6 blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-app-surface px-4 py-2 shadow-xs shadow-black/5 text-xs font-semibold text-app-text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-app-accent" />
            Calm, curated reading — free to start
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="mt-6 text-5xl sm:text-6xl font-semibold tracking-tight text-app-text leading-[1.05]"
          >
            Read what matters.
            <span className="block text-app-text-muted">Skip everything else.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="mt-5 text-[16px] sm:text-[17px] leading-relaxed text-app-text-muted max-w-xl"
          >
            A calm, curated feed of high-quality articles across your interests.
            No noise. No endless scrolling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-2xl bg-app-accent px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-black/10 hover:opacity-95 transition-all"
            >
              Start reading for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center rounded-2xl bg-app-surface px-6 py-3 text-sm font-semibold text-app-text shadow-xs shadow-black/5 hover:-translate-y-0.5 hover:shadow-sm transition-all"
            >
              See how it works
            </Link>
          </motion.div>

          <div className="mt-10 text-xs text-app-text-subtle">
            Trusted sources. Quality-ranked. Built for focus.
          </div>
        </div>

        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mx-auto flex justify-center"
          >
            <FloatingCards />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
