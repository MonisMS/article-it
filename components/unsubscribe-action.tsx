"use client"

import { useState } from "react"

type Props = {
  id: string
  sig: string
}

export function UnsubscribeAction({ id, sig }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, sig }),
      })
      const { error } = await res.json()

      if (error) {
        setError(error)
        return
      }

      setSaved(true)
    } catch {
      setError("Failed to update subscription")
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <p className="text-sm text-zinc-500 leading-relaxed mb-8">
        You are unsubscribed.
      </p>
    )
  }

  return (
    <>
      <p className="text-sm text-zinc-500 leading-relaxed mb-6">
        This will turn off this digest. Click confirm if you want to continue.
      </p>
      <button
        onClick={submit}
        disabled={saving}
        className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving…" : "Confirm unsubscribe"}
      </button>
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </>
  )
}