"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { href: "/admin/topics",      label: "Topics" },
  { href: "/admin/sources",     label: "RSS Sources" },
  { href: "/admin/assignments", label: "Assignments" },
  { href: "/admin/suggestions", label: "Suggestions" },
]

export function AdminTabs() {
  const pathname = usePathname()

  return (
    <div className="mb-8 mt-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="inline-flex min-w-full gap-2 border-b border-stone-200/80 pb-3 dark:border-[#1E2A3A]">
      {TABS.map(({ href, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-stone-300 bg-stone-900 text-white dark:border-amber-500/30 dark:bg-amber-500 dark:text-[#0D1117]"
                : "border-transparent text-stone-500 hover:border-stone-200 hover:bg-stone-50 hover:text-stone-900 dark:text-[#6B7585] dark:hover:border-[#1E2A3A] dark:hover:bg-[#161C26] dark:hover:text-[#F0EDE6]"
            }`}
          >
            {label}
          </Link>
        )
      })}
      </div>
    </div>
  )
}
