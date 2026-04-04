import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ArrowLeft, Check, Sparkles, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Upgrade to Pro — ArticleIt",
  description: "Unlock unlimited topics, priority delivery, and advanced reading analytics.",
}

const FREE_FEATURES = [
  "Personalized article feed",
  "Up to 5 followed topics",
  "Daily reading queue",
  "Bookmarks & reading history",
  "Weekly or daily email digests",
  "Topic suggestions",
]

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited topics",
  "Priority ingestion (articles arrive first)",
  "Full digest history archive",
  "Multiple digest schedules",
  "Advanced reading analytics",
  "Early access to new features",
]

function FeatureRow({ text, included = true }: { text: string; included?: boolean }) {
  return (
    <li className={`flex items-start gap-3 text-sm ${included ? "text-stone-700" : "text-stone-400"}`}>
      <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
        included ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-400"
      }`}>
        <Check className="w-2.5 h-2.5" strokeWidth={3} />
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
  } catch { /* not critical */ }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 px-4 sm:px-10 pt-12 pb-16 text-center">
        {/* Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #f59e0b 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold px-3 py-1 mb-5">
            <Zap className="w-3 h-3 fill-amber-400" />
            Coming soon
          </span>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Upgrade to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Pro
            </span>
          </h1>
          <p className="mt-3 text-stone-400 text-base max-w-md mx-auto">
            More topics, faster delivery, and deeper insights into your reading habits.
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="px-4 sm:px-6 -mt-8 pb-16">
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">

          {/* Free */}
          <div className="rounded-2xl bg-white border border-stone-200 p-6 flex flex-col">
            <div className="mb-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-stone-900">$0</span>
                <span className="text-stone-400 text-sm mb-1.5">/month</span>
              </div>
              <p className="text-sm text-stone-500 mt-1">Everything you need to get started.</p>
            </div>

            <ul className="space-y-2.5 flex-1">
              {FREE_FEATURES.map((f) => <FeatureRow key={f} text={f} />)}
            </ul>

            <div className="mt-6 pt-5 border-t border-stone-100">
              <span className="block w-full text-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-500">
                Current plan
              </span>
            </div>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl bg-gradient-to-b from-stone-900 to-stone-800 border border-stone-700 p-6 flex flex-col overflow-hidden">
            {/* Subtle glow */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
            />

            <div className="relative mb-5">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Pro</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold px-2 py-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Soon
                </span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-white">$9</span>
                <span className="text-stone-400 text-sm mb-1.5">/month</span>
              </div>
              <p className="text-sm text-stone-400 mt-1">For serious readers who want more.</p>
            </div>

            <ul className="relative space-y-2.5 flex-1">
              {PRO_FEATURES.map((f, i) => (
                <li key={f} className={`flex items-start gap-3 text-sm ${i === 0 ? "text-stone-400" : "text-stone-200"}`}>
                  <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                    i === 0 ? "bg-stone-700 text-stone-500" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="relative mt-6 pt-5 border-t border-stone-700">
              <div className="rounded-xl bg-stone-800/60 border border-stone-700 px-4 py-3.5 text-center">
                <p className="text-xs font-semibold text-amber-400 mb-0.5">Launching soon</p>
                {email ? (
                  <p className="text-xs text-stone-400 leading-relaxed">
                    We'll email <span className="text-stone-300 font-medium">{email}</span> the moment Pro is available.
                  </p>
                ) : (
                  <p className="text-xs text-stone-400 leading-relaxed">
                    We'll notify you when Pro is ready.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="flex justify-center mt-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to profile
          </Link>
        </div>
      </div>
    </div>
  )
}
