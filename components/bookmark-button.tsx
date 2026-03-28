"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"

export function BookmarkButton({
  articleId,
  initialBookmarked,
  onToggle,
}: {
  articleId: string
  initialBookmarked: boolean
  onToggle?: (bookmarked: boolean) => void
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    const optimistic = !bookmarked
    setBookmarked(optimistic)
    onToggle?.(optimistic)

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      })
      const { data, error } = await res.json()
      if (error) {
        setBookmarked(!optimistic)
        onToggle?.(!optimistic)
      } else {
        setBookmarked(data.bookmarked)
        onToggle?.(data.bookmarked)
      }
    } catch {
      setBookmarked(!optimistic)
      onToggle?.(!optimistic)
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
          ? "text-app-text bg-app-active hover:bg-app-border"
          : "text-app-text-subtle hover:text-app-text hover:bg-app-hover"
        }`}
    >
      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-current" : ""}`} />
    </button>
  )
}
