import Link from "next/link"
import { BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-lp-border bg-lp-bg">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-lp-text">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-lp-accent">
                <BookOpen className="w-3.5 h-3.5 text-lp-bg" />
              </span>
              ArticleIt
            </Link>
            <p className="mt-2 text-sm text-lp-text-subtle">
              The internet&apos;s best articles, delivered to you.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-lp-text-subtle">
            <Link href="/sign-up" className="hover:text-lp-text transition-colors">Get Started</Link>
            <Link href="/sign-in" className="hover:text-lp-text transition-colors">Sign In</Link>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-lp-border text-xs text-lp-text-subtle">
          © {new Date().getFullYear()} ArticleIt. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
