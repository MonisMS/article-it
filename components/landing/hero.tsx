"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Bookmark, BookOpen, Compass, LayoutDashboard } from "lucide-react"

const WORDS = ["Your", "internet.", "Curated.", "Delivered."]

const MOCK_ARTICLES = [
  {
    topic: "AI & ML",
    title: "GPT-5 and the new frontier of reasoning models",
    source: "The Verge",
    time: "4 min",
    color: "from-violet-400 to-purple-500",
  },
  {
    topic: "Startups",
    title: "Why YC's latest batch is doubling down on infra",
    source: "TechCrunch",
    time: "3 min",
    color: "from-amber-400 to-orange-500",
  },
  {
    topic: "React",
    title: "Server Components in the wild: one year later",
    source: "Smashing Magazine",
    time: "6 min",
    color: "from-cyan-400 to-blue-500",
  },
]

function ProductMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full max-w-3xl mx-auto mt-14"
    >
      {/* Glow under mock */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #f59e0b 0%, transparent 70%)", filter: "blur(24px)" }}
      />

      {/* Browser frame */}
      <div className="relative rounded-2xl border border-lp-border overflow-hidden shadow-2xl shadow-black/40">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-lp-elevated border-b border-lp-border">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <span className="text-[11px] text-lp-text-subtle bg-lp-surface border border-lp-border rounded-md px-3 py-0.5">
              articleit.app/dashboard
            </span>
          </div>
        </div>

        {/* App layout */}
        <div className="flex bg-lp-surface" style={{ height: "340px" }}>

          {/* Sidebar */}
          <div className="w-44 flex-shrink-0 border-r border-lp-border bg-lp-elevated px-2 py-3 flex flex-col gap-0.5 hidden sm:flex">
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <span className="w-5 h-5 rounded-md bg-lp-accent flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-3 h-3 text-lp-bg" />
              </span>
              <span className="text-xs font-semibold text-lp-text">ArticleIt</span>
            </div>
            {[
              { icon: LayoutDashboard, label: "Feed", active: true },
              { icon: Compass, label: "Discover", active: false },
              { icon: Bookmark, label: "Bookmarks", active: false },
            ].map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
                  active ? "bg-lp-surface text-lp-text" : "text-lp-text-subtle"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-lp-accent" : ""}`} />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden px-4 py-4">
            <p className="text-xs font-bold text-lp-text mb-3">Your Feed</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MOCK_ARTICLES.map((a, i) => (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.1, duration: 0.35 }}
                  className="rounded-xl border border-lp-border bg-lp-bg overflow-hidden"
                >
                  <div className={`h-0.5 w-full bg-gradient-to-r ${a.color}`} />
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-lp-accent flex-shrink-0" />
                      <span className="text-[10px] text-lp-text-subtle">{a.topic}</span>
                    </div>
                    <p className="text-xs font-semibold text-lp-text leading-snug line-clamp-2">{a.title}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-lp-text-subtle">
                      <span>{a.source}</span>
                      <span>·</span>
                      <span>{a.time} read</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* Placeholder 3rd card on small screens */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ delay: 1.5, duration: 0.4 }}
                className="rounded-xl border border-lp-border bg-lp-bg p-3 hidden sm:block"
              >
                <div className="h-2 w-1/3 rounded bg-lp-border mb-2" />
                <div className="h-2.5 w-full rounded bg-lp-border mb-1" />
                <div className="h-2.5 w-4/5 rounded bg-lp-border" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Side fade out at bottom — implies more content below */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-lp-bg to-transparent rounded-b-2xl pointer-events-none" />
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-lp-bg px-4 sm:px-6 pt-28 pb-0">
      <AuroraBackground />

      <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-lp-border bg-lp-surface/60 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-lp-text-muted mb-10"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-lp-accent" />
          107 sources · 12 topics · Free to start
        </motion.div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          {WORDS.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className={`inline-block mr-[0.25em] ${
                word === "Curated." ? "text-lp-accent" : "text-lp-text"
              }`}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-lg sm:text-xl text-lp-text-muted leading-relaxed max-w-xl mx-auto mb-10"
        >
          Pick topics you care about. We pull from hundreds of sources and deliver
          the best articles to your feed — or your inbox, on your schedule.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/sign-up"
            className="group relative flex items-center gap-2 rounded-xl bg-lp-accent px-7 py-3.5 text-sm font-semibold text-lp-bg hover:bg-lp-accent-hover transition-colors overflow-hidden"
          >
            Start reading for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/sign-in"
            className="flex items-center gap-2 rounded-xl border border-lp-border bg-lp-surface/40 backdrop-blur-sm px-7 py-3.5 text-sm font-medium text-lp-text-muted hover:text-lp-text hover:border-lp-border-strong transition-colors"
          >
            Sign in
          </Link>
        </motion.div>

        <ProductMock />
      </div>
    </section>
  )
}

function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-aurora absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#E8A838]/10 blur-[120px]" />
      <div className="animate-aurora-slow absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full bg-[#3B82F6]/8 blur-[100px]" />
      <div className="animate-aurora absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#E8A838]/6 blur-[90px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0D1117_80%)]" />
    </div>
  )
}
