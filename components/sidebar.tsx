"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, LayoutDashboard, Bookmark, Settings, LogOut, Compass, History, Lightbulb, ShieldCheck } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { SearchBar } from "@/components/search-bar"

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Feed" },
  { href: "/discover",  icon: Compass,         label: "Discover" },
  { href: "/bookmarks", icon: Bookmark,         label: "Bookmarks" },
  { href: "/history",   icon: History,          label: "History" },
  { href: "/settings",  icon: Settings,         label: "Settings" },
]

type Props = {
  user: { name: string; email: string }
  isAdmin?: boolean
}

export function Sidebar({ user, isAdmin }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-zinc-100 bg-white px-3 py-5">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 px-3 mb-8 font-semibold text-zinc-900">
        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 text-white flex-shrink-0">
          <BookOpen className="w-3.5 h-3.5" />
        </span>
        ArticleIt
      </Link>

      {/* Search */}
      <div className="mb-3 px-0">
        <SearchBar />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${active
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer links */}
      <div className="border-t border-zinc-100 pt-4 mt-4 flex flex-col gap-0.5">
        <Link
          href="/suggest"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/suggest"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
          }`}
        >
          <Lightbulb className="w-4 h-4 flex-shrink-0" />
          Suggest a topic
        </Link>

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname.startsWith("/admin")
                ? "bg-amber-50 text-amber-700"
                : "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            Admin
          </Link>
        )}

        <div className="px-3 mt-2 mb-1">
          <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
          <p className="text-xs text-zinc-400 truncate">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
