"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Compass, Bookmark, History, User } from "lucide-react"

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Feed" },
  { href: "/discover",  icon: Compass,          label: "Discover" },
  { href: "/bookmarks", icon: Bookmark,          label: "Bookmarks" },
  { href: "/history",   icon: History,           label: "History" },
  { href: "/profile",   icon: User,              label: "Profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-app-surface border-t border-app-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={`flex flex-col items-center gap-1 px-3 py-3 transition-colors
                ${active ? "text-app-accent" : "text-app-text-subtle hover:text-app-text"}`}
            >
              <Icon className="w-5 h-5" />
              <span className={`w-1 h-1 rounded-full transition-colors ${active ? "bg-app-accent" : "bg-transparent"}`} />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
