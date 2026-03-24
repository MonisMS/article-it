"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"

export function BookmarkButton({
  articleId,
  initialBookmarked,
}: {
  articleId: string
  initialBookmarked: boolean
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    const optimistic = !bookmarked
    setBookmarked(optimistic) // optimistic update

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      })
      const { data, error } = await res.json()
      if (error) setBookmarked(!optimistic) // revert on error
      else setBookmarked(data.bookmarked)
    } catch {
      setBookmarked(!optimistic) // revert on network error
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? "Remove bookmark" : "Bookmark"}
      className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors
        ${bookmarked
          ? "text-zinc-900 bg-zinc-100 hover:bg-zinc-200"
          : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
        }`}
    >
      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-current" : ""}`} />
    </button>
  )
}
