"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Compass, Search, Bookmark, History, User } from "lucide-react"

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Feed" },
  { href: "/discover",  icon: Compass,         label: "Discover" },
  { href: "/search",    icon: Search,          label: "Search" },
  { href: "/bookmarks", icon: Bookmark,        label: "Bookmarks" },
  { href: "/history",   icon: History,         label: "History" },
  { href: "/profile",   icon: User,            label: "Profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-app-border bg-app-surface/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around px-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-colors ${
                active
                  ? "text-app-text"
                  : "text-app-text-subtle hover:text-app-text"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-app-accent" : ""}`} />
              <span className="text-[11px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
