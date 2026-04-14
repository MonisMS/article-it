"use client"

import Link from "next/link"
import { Zap } from "lucide-react"
import { initials } from "@/lib/utils"

export function ProfileHero({
  name,
  email,
  plan,
  totalReads,
  bookmarkCount,
  topicCount,
}: {
  name: string
  email: string
  plan: string
  totalReads: number
  bookmarkCount: number
  topicCount: number
}) {
  const isPro = plan === "pro"

  return (
    <div className="border-b border-stone-200 bg-stone-50/60 dark:border-lp-border dark:bg-lp-bg">
      <div className="px-4 sm:px-6 py-6">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0">
            <div className="h-20 w-20 shrink-0 rounded-full bg-stone-200 dark:bg-lp-elevated flex items-center justify-center">
              <span className="text-xl font-semibold text-stone-700 dark:text-lp-text">
                {initials(name)}
              </span>
            </div>

            <div className="min-w-0 pt-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[18px] sm:text-[19px] font-semibold text-stone-900 dark:text-lp-text truncate">
                  {name}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    isPro
                      ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
                      : "border-stone-200 bg-stone-100 text-stone-600 dark:border-lp-border dark:bg-lp-elevated dark:text-lp-text-muted"
                  }`}
                >
                  {isPro ? "Pro" : "Free"}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500 dark:text-lp-text-muted truncate">{email}</p>
            </div>
          </div>

          {!isPro ? (
            <Link
              href="/upgrade"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-50 dark:border-lp-border dark:bg-lp-surface dark:text-lp-text dark:hover:bg-lp-elevated"
            >
              <Zap className="h-4 w-4" />
              Upgrade to Pro
            </Link>
          ) : (
            <div aria-hidden className="h-10" />
          )}
        </div>

        {/* Metric row */}
        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-lp-border">
          <div className="grid grid-cols-3 divide-x divide-stone-200 dark:divide-lp-border">
            {[
              { value: totalReads, label: "Articles read" },
              { value: bookmarkCount, label: "Bookmarked" },
              { value: topicCount, label: "Topics" },
            ].map(({ value, label }) => (
              <div key={label} className="px-4 first:pl-0 last:pr-0">
                <div className="text-[18px] font-semibold text-stone-900 leading-none dark:text-lp-text">
                  {value}
                </div>
                <div className="mt-1 text-xs text-stone-500 dark:text-lp-text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
