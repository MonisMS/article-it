"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"

export function SearchBar({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)

  // Keep input in sync if navigating between search pages with different queries
  useEffect(() => { setValue(initialValue) }, [initialValue])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles..."
        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-colors"
      />
    </form>
  )
}
