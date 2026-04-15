"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light"
    const stored = localStorage.getItem("theme")
    if (stored === "light" || stored === "dark") return stored
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const handleSystemChange = () => {
      const stored = localStorage.getItem("theme")
      if (stored === "light" || stored === "dark") return
      setTheme(media.matches ? "dark" : "light")
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key !== "theme") return
      if (e.newValue === "light" || e.newValue === "dark") {
        setTheme(e.newValue)
      }
    }

    media.addEventListener("change", handleSystemChange)
    window.addEventListener("storage", handleStorage)
    return () => {
      media.removeEventListener("change", handleSystemChange)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
