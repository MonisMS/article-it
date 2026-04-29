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
            Pick a topic.
            <span className="block">We handle the rest.</span>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-app-text-muted">
            Everything on that topic — blogs, Reddit, YouTube, HN, newsletters — in one ranked feed, updated daily.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-2xl bg-app-accent px-8 py-4 text-base font-semibold text-white shadow-sm shadow-black/10 hover:opacity-95 transition-all"
            >
              Start reading for free →
            </Link>
            <p className="text-xs text-app-text-subtle">Free to start. No credit card required.</p>
          </div>
        </motion.div>
      </div>

      {/* ── Section 2: Minimal footer strip ───────────────────── */}
      <div className="border-t border-app-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between gap-6">
          <Link href="/" className="text-sm font-semibold text-app-text">
            Curio
          </Link>

          <nav className="flex items-center gap-5 text-xs font-medium text-app-text-muted">
            <Link href="/sign-up" className="hover:text-app-text transition-colors">Get started</Link>
            <Link href="/discover" className="hover:text-app-text transition-colors">Topics</Link>
            <Link href="/discover" className="hover:text-app-text transition-colors">Explore topics</Link>
          </nav>
        </div>
      </div>

      {/* ── Section 3: Tiny copyright ─────────────────────────── */}
      <div className="px-4 sm:px-6 pb-8">
        <div className="mx-auto max-w-6xl text-center text-xs text-app-text-subtle">
          © 2026 Curio · Built with ❤️ by{" "}
          <a
            href="https://m0nis.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-app-text transition-colors underline underline-offset-2"
          >
            Monis
          </a>
        </div>
      </div>
    </section>
  )
}
