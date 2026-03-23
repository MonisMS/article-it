import Link from "next/link"
import { ArrowRight, Rss, Mail, Bookmark, Sparkles, ChevronRight } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"

const TOPICS = [
  { icon: "⚛️", name: "React" },
  { icon: "🟨", name: "JavaScript" },
  { icon: "🤖", name: "AI & ML" },
  { icon: "🚀", name: "Startups" },
  { icon: "🛡️", name: "Cybersecurity" },
  { icon: "📈", name: "Finance" },
  { icon: "🎨", name: "Design" },
  { icon: "☁️", name: "DevOps" },
  { icon: "📱", name: "Product" },
  { icon: "🧬", name: "Science" },
  { icon: "💼", name: "Marketing" },
  { icon: "🌍", name: "Open Source" },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick your topics",
    description:
      "Choose from curated topics — React, AI, Startups, Design, and more. We pull from the best sources so you don't have to.",
  },
  {
    step: "02",
    title: "We find the articles",
    description:
      "Our pipeline scans hundreds of RSS feeds every few hours and surfaces the most relevant articles for each topic you follow.",
  },
  {
    step: "03",
    title: "Get them on your schedule",
    description:
      "Read on the platform anytime or set a digest — daily or weekly — and get a clean email with your top articles waiting in your inbox.",
  },
]

const FEATURES = [
  {
    icon: Rss,
    title: "Aggregated from the best sources",
    description:
      "We pull from hundreds of RSS feeds — blogs, news sites, and publications — so you get broad coverage without the noise.",
  },
  {
    icon: Mail,
    title: "Email digests on your schedule",
    description:
      "Every Sunday morning. Every weekday at 8am. Your call. Get a clean, minimal digest delivered straight to your inbox.",
  },
  {
    icon: Bookmark,
    title: "Bookmark for later",
    description:
      "Save any article with one click. Come back to your reading list whenever you have time.",
  },
  {
    icon: Sparkles,
    title: "One topic per digest",
    description:
      "Schedule each topic separately. JavaScript on Mondays, AI every Sunday. Stay focused, not overwhelmed.",
  },
]

export default function LandingPage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
          {/* Background dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #e4e4e7 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Fade grid at bottom */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 inset-x-0 -z-10 h-48 bg-gradient-to-t from-white"
          />

          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-600 shadow-sm mb-8">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Articles updating every 6 hours
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
              Every article you care about,{" "}
              <span className="text-zinc-400">in one place.</span>
            </h1>

            <p className="mt-6 text-lg text-zinc-500 leading-relaxed max-w-xl mx-auto">
              Pick the topics you love. We scan hundreds of sources and deliver
              the best articles straight to your feed — or your inbox, on your
              schedule.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="group flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                Get started for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/sign-in"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
              >
                Sign in
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Topics ────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-zinc-50">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900">
                Topics you can follow
              </h2>
              <p className="mt-3 text-zinc-500">
                Curated categories, each powered by the best sources in that space.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {TOPICS.map((topic) => (
                <div
                  key={topic.name}
                  className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-5 text-center hover:border-zinc-300 hover:shadow-sm transition-all cursor-default"
                >
                  <span className="text-2xl">{topic.icon}</span>
                  <span className="text-sm font-medium text-zinc-700">
                    {topic.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900">How it works</h2>
              <p className="mt-3 text-zinc-500">Up and running in under 2 minutes.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step}>
                  <div className="text-6xl font-bold text-zinc-100 select-none leading-none mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 bg-zinc-50">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900">
                Everything you need, nothing you don&apos;t
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100 mb-4">
                      <Icon className="w-5 h-5 text-zinc-700" />
                    </div>
                    <h3 className="font-semibold text-zinc-900 mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold text-zinc-900 leading-tight">
              Stop missing articles that matter to you.
            </h2>
            <p className="mt-4 text-zinc-500">
              Free to start. No credit card required.
            </p>
            <Link
              href="/sign-up"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              Create your free account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
