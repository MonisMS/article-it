"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function FinalCta() {
  return (
    <section className="relative bg-lp-bg py-32 px-4 sm:px-6 overflow-hidden border-t border-lp-border">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-aurora absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-lp-accent/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55 }}
        className="relative z-10 mx-auto max-w-2xl text-center"
      >
        <h2 className="text-4xl sm:text-5xl font-bold text-lp-text leading-tight mb-5">
          Stop missing articles<br />
          <span className="text-lp-accent">that matter to you.</span>
        </h2>
        <p className="text-lp-text-muted mb-10 text-lg">
          Free forever. No credit card required.
        </p>

        <Link
          href="/sign-up"
          className="group inline-flex items-center gap-2 rounded-xl bg-lp-accent px-8 py-4 text-base font-semibold text-lp-bg hover:bg-lp-accent-hover transition-colors"
        >
          Create your free account
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </motion.div>
    </section>
  )
}
