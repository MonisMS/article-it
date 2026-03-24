"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Compass, Bookmark, Settings } from "lucide-react"

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Feed" },
  { href: "/discover",  icon: Compass,          label: "Discover" },
  { href: "/bookmarks", icon: Bookmark,          label: "Bookmarks" },
  { href: "/settings",  icon: Settings,          label: "Settings" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-blue-600 border-t border-blue-500 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-colors min-w-0
                ${active ? "text-white" : "text-blue-200 hover:text-white"}`}
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors
                ${active ? "bg-white/20" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
