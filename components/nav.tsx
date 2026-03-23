import Link from "next/link"
import { BookOpen } from "lucide-react"

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          ArticleIt
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
