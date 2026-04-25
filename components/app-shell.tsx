"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"

type Props = {
  user: { name: string; email: string }
  isAdmin?: boolean
  children: React.ReactNode
}

export function AppShell({ user, isAdmin, children }: Props) {
  const pathname = usePathname()
  const [drawerState, setDrawerState] = useState<{ open: boolean; pathname: string }>(() => ({
    open: false,
    pathname,
  }))

  const drawerOpen = drawerState.pathname === pathname ? drawerState.open : false

  function setDrawerOpen(next: boolean) {
    setDrawerState({ open: next, pathname })
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerState({ open: false, pathname })
    }

    if (!drawerOpen) return
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [drawerOpen, pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg dark:bg-lp-bg">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex shrink-0">
        <Sidebar user={user} isAdmin={isAdmin} />
      </div>

      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Mobile header (drawer trigger) */}
        <div className="sticky top-0 z-40 md:hidden border-b border-app-border bg-app-bg">
          <div className="flex h-12 items-center gap-3 px-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open sidebar"
              title="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-app-text-muted transition-colors duration-150 hover:bg-app-hover hover:text-app-text"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[14px] font-semibold text-app-text">Curio</span>
          </div>
        </div>

        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <MobileNav />

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-200 ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          aria-label="Close sidebar"
          className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawerOpen(false)}
        />

        <div
          className={`absolute left-0 top-0 h-full w-68 transform transition-transform duration-200 ease-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar
            variant="drawer"
            user={user}
            isAdmin={isAdmin}
            onRequestClose={() => setDrawerOpen(false)}
          />
        </div>
      </div>
    </div>
  )
}
