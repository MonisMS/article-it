import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { ArrowLeft, Check } from "lucide-react"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Upgrade to Pro - Curio",
  description: "Unlock unlimited topics, priority delivery, and advanced reading analytics.",
}

const FREE_FEATURES = [
  "Personalized article feed",
  "Up to 5 followed topics",
  "Daily reading queue",
  "Bookmarks and reading history",
  "Weekly or daily email digests",
  "Topic suggestions",
]

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited topics",
  "Priority ingestion",
  "Full digest history archive",
  "Multiple digest schedules",
  "Advanced reading insights",
  "Early access to new features",
]

function FeatureRow({ text, muted = false }: { text: string; muted?: boolean }) {
  return (
    <li className={`flex items-start gap-3 text-sm leading-6 ${muted ? "text-stone-400 dark:text-[#8A95A7]" : "text-stone-700 dark:text-[#C8C4BC]"}`}>
      <span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${muted ? "bg-stone-100 text-stone-400 dark:bg-[#1E2533] dark:text-[#6B7585]" : "bg-amber-50 text-amber-700 dark:bg-[#2A3547] dark:text-[#E8A838]"}`}>
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
      {text}
    </li>
  )
}

export default async function UpgradePage() {
  let email = ""
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    email = session?.user.email ?? ""
  } catch {
    // not critical for layout
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6">
      <header className="border-b border-stone-200/80 pb-8 dark:border-[#1E2A3A]">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-[#6B7585]">
            Upgrade
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6] sm:text-[2.4rem]">
            Pro is on the way
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC] sm:text-base">
            A future upgrade for readers who want broader coverage, faster delivery, and a deeper archive.
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="rounded-[1.75rem] border border-stone-200/80 bg-white p-6 dark:border-[#1E2A3A] dark:bg-[#161C26]">
          <div className="border-b border-stone-200/80 pb-4 dark:border-[#1E2A3A]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-[#6B7585]">Free</p>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6]">$0</span>
              <span className="mb-1 text-sm text-stone-400 dark:text-[#6B7585]">/month</span>
            </div>
            <p className="mt-2 text-sm text-stone-500 dark:text-[#8A95A7]">Everything you need to get started.</p>
          </div>

          <ul className="mt-5 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <FeatureRow key={feature} text={feature} />
            ))}
          </ul>

          <div className="mt-6 border-t border-stone-200/80 pt-5 dark:border-[#1E2A3A]">
            <span className="block rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-2.5 text-center text-sm font-medium text-stone-500 dark:border-[#1E2A3A] dark:bg-[#121925] dark:text-[#8A95A7]">
              Current plan
            </span>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200/80 bg-stone-50/80 p-6 dark:border-[#1E2A3A] dark:bg-[#121925]/80">
          <div className="border-b border-stone-200/80 pb-4 dark:border-[#1E2A3A]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-[#6B7585]">Pro</p>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                Coming soon
              </span>
            </div>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6]">$9</span>
              <span className="mb-1 text-sm text-stone-400 dark:text-[#6B7585]">/month</span>
            </div>
            <p className="mt-2 text-sm text-stone-500 dark:text-[#8A95A7]">For readers who want more control and more depth.</p>
          </div>

          <ul className="mt-5 space-y-3">
            {PRO_FEATURES.map((feature, index) => (
              <FeatureRow key={feature} text={feature} muted={index === 0} />
            ))}
          </ul>

          <div className="mt-6 border-t border-stone-200/80 pt-5">
            <div className="flex w-full items-center justify-center rounded-xl bg-app-accent/10 px-4 py-2.5 text-sm font-semibold text-app-accent">
              Coming soon
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-[#8A95A7] dark:hover:text-[#F0EDE6]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to profile
        </Link>
      </div>
    </div>
  )
}
