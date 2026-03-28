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
    <div className="flex gap-1 border-b border-stone-200 dark:border-[#1E2A3A] mb-8">
      {TABS.map(({ href, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              active
                ? "border-amber-500 text-stone-900 dark:text-[#F0EDE6]"
                : "border-transparent text-stone-500 dark:text-[#6B7585] hover:text-stone-900 dark:hover:text-[#F0EDE6]"
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
