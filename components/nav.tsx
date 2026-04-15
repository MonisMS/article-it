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
      <nav className={`flex items-center justify-between gap-8 rounded-2xl px-5 py-3 transition-all duration-300 ${
        scrolled
          ? "bg-app-surface/90 backdrop-blur-md shadow-md shadow-black/10 w-full max-w-3xl"
          : "bg-app-surface/70 backdrop-blur-sm shadow-sm shadow-black/5 w-full max-w-4xl"
      }`}>
        <Link href="/" className="flex items-center gap-2 font-semibold text-app-text">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-app-accent">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </span>
          Curio
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-app-text-muted hover:text-app-text transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-app-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  )
}
