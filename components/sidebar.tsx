"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, LayoutDashboard, Bookmark, User, LogOut, Compass, History, Lightbulb, ShieldCheck, Search } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { initials } from "@/lib/utils"

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Feed" },
  { href: "/discover",  icon: Compass,         label: "Discover" },
  { href: "/search",    icon: Search,          label: "Search" },
  { href: "/bookmarks", icon: Bookmark,        label: "Bookmarks" },
  { href: "/history",   icon: History,         label: "History" },
  { href: "/profile",   icon: User,            label: "Profile" },
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
    <aside className="flex h-full w-60 flex-col border-r border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-3 py-5">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-3 mb-8 font-semibold text-stone-900 dark:text-[#F0EDE6]">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-900 dark:bg-[#E8A838] text-white dark:text-[#0D1117] flex-shrink-0">
          <BookOpen className="w-3.5 h-3.5" />
        </span>
        ArticleIt
      </Link>

      <nav className="flex-1 flex flex-col gap-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150
                ${active
                  ? "bg-stone-100 dark:bg-[#1E2533] text-stone-900 dark:text-[#F0EDE6] font-semibold"
                  : "text-stone-500 dark:text-[#6B7585] hover:bg-stone-50 dark:hover:bg-[#1E2533] hover:text-stone-900 dark:hover:text-[#F0EDE6] font-normal"
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-amber-600 dark:text-[#E8A838]" : ""}`} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-stone-100 dark:border-[#1E2A3A] pt-3 mt-4 flex flex-col gap-0.5">
        <Link
          href="/suggest"
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
            pathname === "/suggest"
              ? "bg-stone-100 dark:bg-[#1E2533] text-stone-900 dark:text-[#F0EDE6]"
              : "text-stone-500 dark:text-[#6B7585] hover:bg-stone-50 dark:hover:bg-[#1E2533] hover:text-stone-900 dark:hover:text-[#F0EDE6]"
          }`}
        >
          <Lightbulb className="w-4 h-4 flex-shrink-0" />
          Suggest a topic
        </Link>

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
              pathname.startsWith("/admin")
                ? "bg-amber-50 dark:bg-[#2A3547] text-amber-700 dark:text-[#E8A838]"
                : "text-amber-600 dark:text-[#E8A838] hover:bg-amber-50 dark:hover:bg-[#2A3547]"
            }`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            Admin
          </Link>
        )}

        <div className="flex items-center gap-2.5 px-3 mt-3 mb-1 border-t border-stone-100 dark:border-[#1E2A3A] pt-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-[#2A3547] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-amber-700 dark:text-[#E8A838]">{initials(user.name)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-900 dark:text-[#F0EDE6] truncate">{user.name}</p>
            <p className="text-xs text-stone-400 dark:text-[#6B7585] truncate">{user.email}</p>
          </div>
          <ThemeToggle />
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-500 dark:text-[#6B7585] hover:bg-stone-50 dark:hover:bg-[#1E2533] hover:text-stone-900 dark:hover:text-[#F0EDE6] transition-all duration-150"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
