import Link from "next/link"
import { BookOpen } from "lucide-react"
import { db } from "@/lib/db"
import { topics } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const SEO_LINKS = [
  { href: "/pocket-alternative", label: "Pocket Alternative" },
  { href: "/feedly-alternative", label: "Feedly Alternative" },
  { href: "/mailbrew-alternative", label: "Mailbrew Alternative" },
  { href: "/readwise-alternative", label: "Readwise Alternative" },
  { href: "/personalized-email-digest", label: "Email Digest" },
  { href: "/rss-reader-email", label: "RSS to Email" },
  { href: "/stay-informed", label: "Stay Informed" },
]

export async function Footer() {
  const allTopics = await db
    .select({ slug: topics.slug, name: topics.name, icon: topics.icon })
    .from(topics)
    .where(eq(topics.isActive, true))
    .limit(12)

  return (
    <footer className="bg-app-bg">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-app-text">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-app-accent">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </span>
              ArticleIt
            </Link>
            <p className="mt-2 text-sm text-app-text-muted">
              The internet&apos;s best articles, delivered to you.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-app-text uppercase tracking-widest mb-3">Product</p>
            <nav className="flex flex-col gap-2 text-sm text-app-text-muted">
              <Link href="/sign-up" className="hover:text-app-text transition-colors">Get Started</Link>
              <Link href="/sign-in" className="hover:text-app-text transition-colors">Sign In</Link>
              <Link href="/personalized-email-digest" className="hover:text-app-text transition-colors">Email Digest</Link>
              <Link href="/rss-reader-email" className="hover:text-app-text transition-colors">RSS to Email</Link>
            </nav>
          </div>

          {/* Alternatives */}
          <div>
            <p className="text-xs font-semibold text-app-text uppercase tracking-widest mb-3">Alternatives</p>
            <nav className="flex flex-col gap-2 text-sm text-app-text-muted">
              {SEO_LINKS.slice(0, 5).map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-app-text transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Topics */}
          <div>
            <p className="text-xs font-semibold text-app-text uppercase tracking-widest mb-3">Topics</p>
            <nav className="flex flex-col gap-2 text-sm text-app-text-muted">
              {allTopics.map((t) => (
                <Link key={t.slug} href={`/topics/${t.slug}`} className="hover:text-app-text transition-colors">
                  {t.icon} {t.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="pt-6 border-t border-app-border text-xs text-app-text-subtle">
          © {new Date().getFullYear()} ArticleIt. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
