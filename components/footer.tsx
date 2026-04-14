import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-app-surface-hover">
      <div className="border-t border-app-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between gap-6">
          <Link href="/" className="text-sm font-semibold text-app-text">
            ArticleIt
          </Link>

          <nav className="flex items-center gap-5 text-xs font-medium text-app-text-muted">
            <Link href="/sign-up" className="hover:text-app-text transition-colors">Product</Link>
            <Link href="/#features" className="hover:text-app-text transition-colors">Features</Link>
            <Link href="/discover" className="hover:text-app-text transition-colors">Topics</Link>
            <a href="https://github.com" className="hover:text-app-text transition-colors" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://twitter.com" className="hover:text-app-text transition-colors" target="_blank" rel="noreferrer">Twitter</a>
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-8">
        <div className="mx-auto max-w-6xl text-center text-xs text-app-text-subtle">
          © 2026 ArticleIt — Built for focused reading
        </div>
      </div>
    </footer>
  )
}
