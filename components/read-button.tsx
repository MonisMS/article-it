"use client"

import { useState } from "react"
import { Check } from "lucide-react"

export function ReadButton({
  articleId,
  initialRead,
  onToggle,
}: {
  articleId: string
  initialRead: boolean
  onToggle?: (read: boolean) => void
}) {
  const [read, setRead] = useState(initialRead)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    const optimistic = !read
    setRead(optimistic)
    onToggle?.(optimistic)

    try {
      const res = await fetch("/api/user/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      })
      const { data, error } = await res.json()
      if (error) {
        setRead(!optimistic)
        onToggle?.(!optimistic)
      } else {
        setRead(data.read)
        onToggle?.(data.read)
      }
    } catch {
      setRead(!optimistic)
      onToggle?.(!optimistic)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={read ? "Mark as unread" : "Mark as read"}
      className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors
        ${read
          ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
          : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
        }`}
    >
      <Check className="w-3.5 h-3.5" />
    </button>
  )
}
