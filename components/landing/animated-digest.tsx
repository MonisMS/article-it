"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Bell, Bookmark, Mail } from "lucide-react"

const NOTIFICATIONS = [
  { icon: Bell,     color: "text-lp-accent",       label: "5 new articles in AI & ML" },
  { icon: Mail,     color: "text-lp-text",         label: "Your 9am digest is ready · 12 articles" },
  { icon: Bookmark, color: "text-lp-accent-hover", label: "Bookmarked: The State of LLMs in 2025" },
  { icon: Bell,     color: "text-lp-accent",       label: "3 new articles in Cybersecurity" },
  { icon: Mail,     color: "text-lp-text",         label: "Your Sunday AI digest · 8 articles" },
  { icon: Bookmark, color: "text-lp-accent-hover", label: "Bookmarked: Why Rust Is Taking Over Systems" },
]

export function AnimatedDigest() {
  const [visible, setVisible] = useState(NOTIFICATIONS.slice(0, 3))
  const [index, setIndex] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => [NOTIFICATIONS[index % NOTIFICATIONS.length], ...prev.slice(0, 2)])
      setIndex((i) => i + 1)
    }, 2200)
    return () => clearInterval(interval)
  }, [index])

  return (
    <section className="bg-lp-bg py-28 px-4 sm:px-6 border-t border-lp-border">
      <div className="mx-auto max-w-5xl grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-lp-accent mb-3">
            Stay in the loop
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-lp-text leading-tight mb-5">
            Your feed stays fresh.<br />
            <span className="text-lp-text-muted">So does your inbox.</span>
          </h2>
          <p className="text-lp-text-muted leading-relaxed">
            New articles flow in every few hours. Set a digest and get the best
            ones delivered to your email at the time you choose — no log-in
            required to catch up.
          </p>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-lp-border bg-lp-surface overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-lp-border">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-lp-border-strong" />
                <span className="w-2.5 h-2.5 rounded-full bg-lp-border-strong" />
                <span className="w-2.5 h-2.5 rounded-full bg-lp-border-strong" />
              </div>
              <span className="text-xs text-lp-text-subtle ml-2">ArticleIt notifications</span>
            </div>

            <div className="p-4 space-y-2 min-h-[180px]">
              <AnimatePresence initial={false}>
                {visible.map((n, i) => {
                  const Icon = n.icon
                  return (
                    <motion.div
                      key={`${n.label}-${i}`}
                      initial={{ opacity: 0, y: -16, scale: 0.97 }}
                      animate={{ opacity: i === 0 ? 1 : 0.55 - i * 0.1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="flex items-center gap-3 rounded-xl border border-lp-border bg-lp-elevated px-4 py-3"
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${n.color}`} />
                      <span className="text-sm text-lp-text-muted">{n.label}</span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 rounded-b-2xl bg-gradient-to-t from-lp-bg to-transparent" />
        </div>
      </div>
    </section>
  )
}
