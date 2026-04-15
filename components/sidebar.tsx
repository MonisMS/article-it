"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  BookOpen,
  LayoutDashboard,
  Bookmark,
  User,
  LogOut,
  Compass,
  History,
  Lightbulb,
  ShieldCheck,
  Search,
  ChevronsLeft,
  ChevronUp,
  CreditCard,
} from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { initials } from "@/lib/utils"

const PRIMARY_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Feed" },
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { href: "/history", icon: History, label: "History" },
]

const SECONDARY_NAV = [
  { href: "/suggest", icon: Lightbulb, label: "Suggest a topic" },
  { href: "/profile", icon: User, label: "Profile" },
]

type Props = {
  user: { name: string; email: string }
  isAdmin?: boolean
  variant?: "desktop" | "drawer"
  onRequestClose?: () => void
}

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar({ user, isAdmin, variant = "desktop", onRequestClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const isDrawer = variant === "drawer"
  const [collapsed, setCollapsed] = useState(() => {
    if (variant === "drawer") return false
    if (typeof window === "undefined") return false
    return window.localStorage.getItem("articleit-sidebar-collapsed") === "1"
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  function setCollapsedPersist(next: boolean) {
    setCollapsed(next)
    if (isDrawer) return
    window.localStorage.setItem("articleit-sidebar-collapsed", next ? "1" : "0")
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setUserMenuOpen(false)
    }

    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  const profileInitials = initials(user.name || "Reader")

  const navItemClass = (active: boolean) => {
    const base = collapsed
      ? "group relative flex h-10 items-center justify-center rounded-xl transition-colors duration-200"
      : "group relative flex h-10 items-center gap-3 rounded-xl px-3 transition-colors duration-200"

    return `${base} ${
      active
        ? "bg-[#F3EEE3] text-[#2D261B] dark:bg-app-surface-hover dark:text-app-text"
        : "text-[#6F675A] hover:bg-[#F5F1E8] hover:text-[#2F271D] dark:text-app-text-muted dark:hover:bg-app-surface-hover dark:hover:text-app-text"
    }`
  }

  const tooltipClass = "pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-[#E8E0D1] bg-[#FFFDF8] px-2.5 py-1.5 text-xs font-medium text-[#3E3528] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 dark:border-[#2D3B4F] dark:bg-[#1B2430] dark:text-[#E7DCC2]"
  const menuPanelClass = "absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-[#E8E0D1] bg-[#FFFDF8] p-1 shadow-sm dark:border-[#2D3B4F] dark:bg-[#1B2430]"
  const menuItemClass =
    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#3E3528] transition-colors duration-150 hover:bg-[#F3EEE4] hover:text-[#2F271D] dark:text-[#E7DCC2] dark:hover:bg-[#223041] dark:hover:text-[#F4F7FF]"

  const renderNavItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string
    icon: React.ComponentType<{ className?: string }>
    label: string
  }) => {
    const active = isItemActive(pathname, href)

    return (
      <Link
        key={href}
        href={href}
        aria-label={label}
        title={collapsed ? label : undefined}
        className={navItemClass(active)}
      >
        <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-[#9D5C09] dark:text-app-accent" : "text-[#8A8173] group-hover:text-[#5B5245] dark:text-app-text-subtle dark:group-hover:text-app-text"}`} />
        {!collapsed && (
          <span className={`truncate text-[14px] ${active ? "font-semibold" : "font-medium"}`}>
            {label}
          </span>
        )}
        {collapsed && <span className={tooltipClass}>{label}</span>}
      </Link>
    )
  }

  return (
    <aside
      className={`${isDrawer ? "flex h-full" : "sticky top-0 flex h-screen"} flex-col justify-between border-r border-[#EAE4D8] bg-[#F8F6F1] py-5 transition-[width,padding] duration-200 ease-out dark:border-app-border dark:bg-app-surface ${collapsed ? "w-19 px-3" : "w-68 px-4"}`}
    >
      <div>
        <div className={`mb-6 h-11 ${collapsed ? "flex items-center justify-center" : "flex items-center justify-between px-3"}`}>
          {!collapsed ? (
            <>
              <Link href="/dashboard" aria-label="ArticleIt home" className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFE8DB] text-[#7A5A2A] dark:bg-app-surface-hover dark:text-app-accent">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="text-[14px] font-semibold text-[#2C2417] dark:text-[#EAE4D8]">
                  ArticleIt
                </span>
              </Link>

              {isDrawer ? (
                <button
                  type="button"
                  onClick={onRequestClose}
                  aria-label="Close sidebar"
                  title="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#8A8173] transition-colors duration-150 hover:bg-[#F1ECE1] hover:text-[#4F463B] dark:text-[#8E99AA] dark:hover:bg-[#1F2936] dark:hover:text-[#D7E0EE]"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setCollapsedPersist(true)}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#8A8173] transition-colors duration-150 hover:bg-[#F1ECE1] hover:text-[#4F463B] dark:text-[#8E99AA] dark:hover:bg-[#1F2936] dark:hover:text-[#D7E0EE]"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsedPersist(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="group relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFE8DB] text-[#7A5A2A] transition-colors duration-150 hover:bg-[#E7E0D1] dark:bg-app-surface-hover dark:text-app-accent dark:hover:bg-app-surface-active"
            >
              <BookOpen className="h-5 w-5" />
              <span className={tooltipClass}>Expand</span>
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1.5">
          {PRIMARY_NAV.map(renderNavItem)}
        </nav>

        <div className="mt-6 border-t border-[#EAE4D8] pt-5 dark:border-[#2A3442]">
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#A09686] dark:text-[#788395]">
              More
            </p>
          )}

          <nav className="flex flex-col gap-1.5">
            {SECONDARY_NAV.map(renderNavItem)}
            {isAdmin && renderNavItem({ href: "/admin", icon: ShieldCheck, label: "Admin" })}
          </nav>
        </div>
      </div>

      <div className="mt-4 border-t border-[#EAE4D8] pt-4 dark:border-[#2A3442]">
        {!collapsed ? (
          <div className="relative" ref={userMenuRef}>
            {userMenuOpen && (
              <div className={menuPanelClass} role="menu" aria-label="User menu">
                <Link href="/upgrade" className={menuItemClass} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                  <CreditCard className="h-4 w-4 text-[#8A8173] dark:text-[#9EA9B8]" />
                  Billing
                </Link>
                <button type="button" onClick={handleSignOut} className={menuItemClass} role="menuitem">
                  <LogOut className="h-4 w-4 text-[#8A8173] dark:text-[#9EA9B8]" />
                  Sign out
                </button>
              </div>
            )}

            <div className="mb-2 flex w-full items-center gap-3 rounded-xl bg-[#F2EDE2] px-3 py-2.5 transition-colors duration-150 hover:bg-[#ECE5D6] dark:bg-[#1C2633] dark:hover:bg-[#223041]">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCE8BC] dark:bg-app-surface-hover">
                  <span className="text-xs font-semibold text-[#9D5C09] dark:text-app-accent">{profileInitials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-[#2D261B] dark:text-[#EAE4D8]">{user.name}</p>
                  <p className="truncate text-xs text-[#8C8373] dark:text-[#8A95A7]">{user.email}</p>
                </div>
                <ChevronUp className={`h-4 w-4 shrink-0 text-[#8A8173] transition-transform duration-200 dark:text-[#9EA9B8] ${userMenuOpen ? "rotate-0" : "rotate-180"}`} />
              </button>

              <div className="shrink-0">
                <ThemeToggle />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-2" ref={userMenuRef}>
            {userMenuOpen && (
              <div className={`${menuPanelClass} left-1/2 w-55 -translate-x-1/2`} role="menu" aria-label="User menu">
                <Link href="/upgrade" className={menuItemClass} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                  <CreditCard className="h-4 w-4 text-[#8A8173] dark:text-[#9EA9B8]" />
                  Billing
                </Link>
                <button type="button" onClick={handleSignOut} className={menuItemClass} role="menuitem">
                  <LogOut className="h-4 w-4 text-[#8A8173] dark:text-[#9EA9B8]" />
                  Sign out
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-label="Account"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EDE2] transition-colors duration-150 hover:bg-[#ECE5D6] dark:bg-[#1C2633] dark:hover:bg-[#223041]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FCE8BC] dark:bg-[#2D3A4D]">
                <span className="text-xs font-semibold text-[#9D5C09] dark:text-app-accent">{profileInitials}</span>
              </div>
              <span className={tooltipClass}>Account</span>
            </button>

            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  )
}
