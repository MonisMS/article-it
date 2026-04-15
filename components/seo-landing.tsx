import Link from "next/link"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { ArrowRight, BookOpen, CheckCircle2, Mail, Rss, Zap } from "lucide-react"

export type SeoFeature = { icon: React.ReactNode; title: string; description: string }
export type SeoFaq = { q: string; a: string }
export type SeoComparison = { label: string; them: boolean; us: boolean }

type Props = {
  h1: string
  subheadline: string
  ctaText?: string
  features: SeoFeature[]
  faqs: SeoFaq[]
  comparisons?: SeoComparison[]
  competitorName?: string
  jsonLd: object
}

const DEFAULT_FEATURES: SeoFeature[] = [
  {
    icon: <Rss className="w-5 h-5 text-amber-500" />,
    title: "200+ curated sources",
    description: "Hand-picked RSS feeds ranked by engagement quality — no spam, no low-effort content.",
  },
  {
    icon: <Mail className="w-5 h-5 text-amber-500" />,
    title: "Email digest on your schedule",
    description: "Daily, weekly, or custom frequency. Arrives in your inbox when you want it.",
  },
  {
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    title: "Quality-ranked feed",
    description: "Articles ranked by source quality score — you see the best stuff first.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-amber-500" />,
    title: "12+ topics",
    description: "AI, Startups, React, Productivity, Design, and more — or suggest your own.",
  },
]

export function SeoLanding({ h1, subheadline, ctaText = "Start free — no card needed", features, faqs, comparisons, competitorName, jsonLd }: Props) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0D1117]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 px-4 sm:px-6 py-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgba(217,119,6,0.15),transparent_60%)] pointer-events-none" />
          <div className="relative max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
              {h1}
            </h1>
            <p className="text-stone-300 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              {subheadline}
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-8 py-3.5 rounded-full transition-colors"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-stone-500 text-xs mt-3">Free forever · No credit card · Set up in 2 minutes</p>
          </div>
        </section>

        {/* Comparison table */}
        {comparisons && competitorName && (
          <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-[#F0EDE6] text-center mb-8">
              Curio vs {competitorName}
            </h2>
            <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] overflow-hidden">
              <div className="grid grid-cols-3 bg-stone-100 dark:bg-[#161C26] px-4 py-3 text-xs font-semibold text-stone-500 dark:text-[#6B7585] uppercase tracking-wide">
                <span>Feature</span>
                <span className="text-center">{competitorName}</span>
                <span className="text-center text-amber-600 dark:text-amber-400">Curio</span>
              </div>
              {comparisons.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 px-4 py-3.5 text-sm ${i % 2 === 0 ? "bg-white dark:bg-[#0D1117]" : "bg-stone-50 dark:bg-[#111720]"}`}
                >
                  <span className="text-stone-700 dark:text-[#B8C0CC]">{row.label}</span>
                  <span className="flex justify-center">
                    {row.them ? (
                      <CheckCircle2 className="w-4 h-4 text-stone-400" />
                    ) : (
                      <span className="text-stone-300 dark:text-[#4A5568]">—</span>
                    )}
                  </span>
                  <span className="flex justify-center">
                    {row.us ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    ) : (
                      <span className="text-stone-300 dark:text-[#4A5568]">—</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Features */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-[#F0EDE6] text-center mb-10">
            Everything you need, nothing you don&apos;t
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {(features.length > 0 ? features : DEFAULT_FEATURES).map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    {f.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6]">{f.title}</p>
                    <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-1 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-[#F0EDE6] text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-5"
              >
                <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6] mb-2">{faq.q}</p>
                <p className="text-sm text-stone-500 dark:text-[#6B7585] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
          <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-amber-950 p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to upgrade your reading?</h2>
            <p className="text-stone-400 text-sm mb-6">
              Join thousands of curious people who use Curio to stay on top of what matters.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-8 py-3.5 rounded-full transition-colors"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
