"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function FinalCta() {
  return (
    <section className="relative bg-app-bg py-24 px-4 sm:px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55 }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-app-text leading-tight mb-5">
          Your reading space for the web.
          <span className="block text-app-text-muted">Calm by default.</span>
        </h2>
        <p className="text-app-text-muted mb-10 text-[16px] leading-relaxed">
          Start free, pick a few topics, and let the good writing find you.
        </p>

        <Link
          href="/sign-up"
          className="group inline-flex items-center gap-2 rounded-2xl bg-app-accent px-8 py-4 text-base font-semibold text-white shadow-sm shadow-black/10 hover:opacity-95 transition-all"
        >
          Start reading for free
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <p className="mt-5 text-xs text-app-text-subtle">No credit card required.</p>
      </motion.div>
    </section>
  )
}
