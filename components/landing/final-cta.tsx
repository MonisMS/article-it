"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function FinalCta() {
  return (
    <section className="bg-app-surface-hover">
      {/* ── Section 1: Final CTA (replaces footer) ─────────────── */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-32 pb-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-app-accent/10 blur-[90px]" />
          <div className="absolute right-[-220px] top-[120px] h-[420px] w-[420px] rounded-full bg-app-accent/8 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative z-10 mx-auto max-w-3xl text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-app-text leading-tight">
            Your reading space for the web.
            <span className="block">Calm by default.</span>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-app-text-muted">
            Start reading. Let the good writing find you.
          </p>

          <div className="mt-10">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-2xl bg-app-accent px-8 py-4 text-base font-semibold text-white shadow-sm shadow-black/10 hover:opacity-95 transition-all"
            >
              Start reading for free →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Section 2: Minimal footer strip ───────────────────── */}
      <div className="border-t border-app-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between gap-6">
          <Link href="/" className="text-sm font-semibold text-app-text">
            ArticleIt
          </Link>

          <nav className="flex items-center gap-5 text-xs font-medium text-app-text-muted">
            <Link href="/sign-up" className="hover:text-app-text transition-colors">Product</Link>
            <Link href="#features" className="hover:text-app-text transition-colors">Features</Link>
            <Link href="/discover" className="hover:text-app-text transition-colors">Topics</Link>
            <a href="https://github.com" className="hover:text-app-text transition-colors" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://twitter.com" className="hover:text-app-text transition-colors" target="_blank" rel="noreferrer">Twitter</a>
          </nav>
        </div>
      </div>

      {/* ── Section 3: Tiny copyright ─────────────────────────── */}
      <div className="px-4 sm:px-6 pb-8">
        <div className="mx-auto max-w-6xl text-center text-xs text-app-text-subtle">
          © 2026 ArticleIt — Built for focused reading
        </div>
      </div>
    </section>
  )
}
