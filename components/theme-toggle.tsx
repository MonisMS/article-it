"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:text-[#6B7585] dark:hover:text-[#F0EDE6] dark:hover:bg-[#1E2533] transition-colors"
    >
      {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  )
}
