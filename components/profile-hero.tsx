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
    <div className="border-b border-stone-200/80 bg-stone-50/40 dark:border-lp-border dark:bg-lp-bg">
      <div className="px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-white shadow-[0_18px_40px_rgba(28,25,23,0.06)] dark:bg-lp-surface">
              <span className="text-[1.7rem] font-semibold text-stone-700 dark:text-lp-text">
                {initials(name)}
              </span>
            </div>

            <div className="min-w-0 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-lp-text-subtle">
                Profile
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                <h1 className="truncate text-[1.75rem] font-semibold tracking-tight text-stone-900 dark:text-lp-text">
                  {name}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    isPro
                      ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
                      : "border-stone-200 bg-white text-stone-500 dark:border-lp-border dark:bg-lp-surface dark:text-lp-text-muted"
                  }`}
                >
                  {isPro ? "Pro" : "Free"}
                </span>
              </div>
              <p className="mt-2 truncate text-sm text-stone-500 dark:text-lp-text-muted">{email}</p>
            </div>
          </div>

          {!isPro ? (
            <Link
              href="/upgrade"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-50 dark:border-lp-border dark:bg-lp-surface dark:text-lp-text dark:hover:bg-lp-elevated"
            >
              <Zap className="h-4 w-4" />
              Upgrade to Pro
            </Link>
          ) : (
            <div aria-hidden className="hidden h-10 lg:block" />
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-6 border-t border-stone-200/80 pt-4 dark:border-lp-border">
          {[
            { value: totalReads, label: "Reads" },
            { value: bookmarkCount, label: "Bookmarks" },
            { value: topicCount, label: "Topics" },
          ].map(({ value, label }) => (
            <div key={label} className="min-w-[6rem]">
              <div className="text-lg font-semibold leading-none text-stone-900 dark:text-lp-text">
                {value}
              </div>
              <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400 dark:text-lp-text-subtle">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
