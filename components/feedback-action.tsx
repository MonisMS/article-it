"use client"

import { useState } from "react"

type Props = {
  userId: string
  articleId: string
  digestLogId: string
  rating: "up" | "down"
  sig: string
}

export function FeedbackAction({ userId, articleId, digestLogId, rating, sig }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, articleId, digestLogId, rating, sig }),
      })
      const { error } = await res.json()

      if (error) {
        setError(error)
        return
      }

      setSaved(true)
    } catch {
      setError("Failed to save feedback")
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <p className="text-sm text-stone-500 leading-relaxed mb-8">
        Thanks. Your feedback has been saved.
      </p>
    )
  }

  return (
    <>
      <p className="text-sm text-stone-500 leading-relaxed mb-6">
        This will record your {rating === "up" ? "thumbs up" : "thumbs down"} for the article. Click confirm to continue.
      </p>
      <button
        onClick={submit}
        disabled={saving}
        className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving…" : "Confirm feedback"}
      </button>
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </>
  )
}