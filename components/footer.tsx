import Link from "next/link"
import { BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 text-white">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              ArticleIt
            </Link>
            <p className="mt-2 text-sm text-zinc-500">
              The internet&apos;s best articles, delivered to you.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
            <Link href="/sign-up" className="hover:text-zinc-900 transition-colors">Get Started</Link>
            <Link href="/sign-in" className="hover:text-zinc-900 transition-colors">Sign In</Link>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-100 text-xs text-zinc-400">
          © {new Date().getFullYear()} ArticleIt. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
