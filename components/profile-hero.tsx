"use client"

import { initials } from "@/lib/utils"

export function ProfileHero({
  name,
  email,
  totalReads,
  bookmarkCount,
  topicCount,
}: {
  name: string
  email: string
  totalReads: number
  bookmarkCount: number
  topicCount: number
}) {
  return (
    <div className="border-b border-stone-200/80 bg-stone-50/40">
      <div className="px-4 py-8 sm:px-6">
        <div className="flex min-w-0 items-start gap-5">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-white shadow-[0_18px_40px_rgba(28,25,23,0.06)]">
            <span className="text-[1.7rem] font-semibold text-stone-700">
              {initials(name)}
            </span>
          </div>

          <div className="min-w-0 pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              Profile
            </p>
            <h1 className="mt-2 truncate text-[1.75rem] font-semibold tracking-tight text-stone-900">
              {name}
            </h1>
            <p className="mt-2 truncate text-sm text-stone-500">{email}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 border-t border-stone-200/80 pt-4">
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
