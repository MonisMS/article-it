"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import { useEffect, useState } from "react"

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <nav className={`flex items-center justify-between gap-8 rounded-2xl border px-5 py-3 transition-all duration-300 ${
        scrolled
          ? "border-lp-border bg-lp-surface/90 backdrop-blur-md shadow-lg shadow-black/20 w-full max-w-2xl"
          : "border-lp-border/50 bg-lp-surface/40 backdrop-blur-sm w-full max-w-3xl"
      }`}>
        <Link href="/" className="flex items-center gap-2 font-semibold text-lp-text">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-lp-accent">
            <BookOpen className="w-3.5 h-3.5 text-lp-bg" />
          </span>
          ArticleIt
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-lp-text-muted hover:text-lp-text transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-lp-accent px-4 py-2 text-sm font-semibold text-lp-bg hover:bg-lp-accent-hover transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  )
}
