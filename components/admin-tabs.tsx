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
    <div className="flex gap-1 border-b border-zinc-200 mb-8">
      {TABS.map(({ href, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              active
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
