"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const WORDS = ["Your", "internet.", "Curated.", "Delivered."]

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-lp-bg px-4 sm:px-6">
      <AuroraBackground />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
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
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-lp-text-subtle tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-lp-text-subtle to-transparent"
        />
      </motion.div>
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
