"use client"

import { motion } from "framer-motion"

export function CalmReading() {
  return (
    <section className="bg-app-bg px-4 sm:px-6 py-24">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-app-text-subtle">
            Calm reading
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-app-text">
            A calmer way to stay informed.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-app-text-muted max-w-xl">
            ArticleIt is built for focus. No infinite feeds, no attention traps — just a clean place to read and return later.
          </p>

          <div className="mt-8 grid gap-3">
            {["Clean typography and comfortable spacing", "Short context before every article", "Save what matters and move on"].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-app-surface px-5 py-4 shadow-xs shadow-black/5">
                <span className="mt-2 h-2 w-2 rounded-full bg-app-accent" />
                <p className="text-sm text-app-text-muted leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="rounded-4xl bg-app-surface shadow-md shadow-black/10 p-8"
          >
            <p className="text-sm font-semibold text-app-text">A note from your future self</p>
            <p className="mt-3 text-[15px] leading-relaxed text-app-text-muted">
              “I don’t need more content. I need fewer, better things to read — and a place that makes it easy to come back.”
            </p>
            <div className="mt-6 flex items-center justify-between text-xs text-app-text-subtle">
              <span>Saved in Bookmarks</span>
              <span>2 weeks later</span>
            </div>
            <div className="mt-6 h-px bg-app-border" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { k: "Less noise", v: "More signal" },
                { k: "Short sessions", v: "Better habits" },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl bg-app-surface-hover px-5 py-4">
                  <p className="text-xs font-semibold tracking-wide text-app-text-subtle uppercase">{x.k}</p>
                  <p className="mt-2 text-sm font-semibold text-app-text">{x.v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
