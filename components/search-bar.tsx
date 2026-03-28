"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"

export function SearchBar({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)

  useEffect(() => { setValue(initialValue) }, [initialValue])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles..."
        className="w-full rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-stone-50 dark:bg-[#1E2533] pl-8 pr-3 py-2 text-sm text-stone-900 dark:text-[#F0EDE6] placeholder:text-stone-400 dark:placeholder:text-[#6B7585] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:bg-white dark:focus:bg-[#252F3F] transition-all"
      />
    </form>
  )
}

export function SearchBarHero({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)

  useEffect(() => { setValue(initialValue) }, [initialValue])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles, topics, sources…"
        className="w-full rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] pl-12 pr-5 py-4 text-base text-stone-900 dark:text-[#F0EDE6] placeholder:text-stone-400 dark:placeholder:text-[#6B7585] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 shadow-sm hover:border-stone-300 dark:hover:border-[#2D3B4F] transition-all"
      />
      {value && (
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
        >
          Search
        </button>
      )}
    </form>
  )
}
