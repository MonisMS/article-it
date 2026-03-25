"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import type { SuggestionRow } from "@/lib/db/queries/suggestions"

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:  { label: "Under review", className: "bg-amber-50 text-amber-700" },
  approved: { label: "Approved",     className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected",     className: "bg-zinc-100 text-zinc-500" },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status] ?? { label: status, className: "bg-zinc-100 text-zinc-500" }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export function TopicSuggestForm({ initialSuggestions }: { initialSuggestions: SuggestionRow[] }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>(initialSuggestions)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("/api/topics/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      })
      const { data, error } = await res.json()

      if (error) { setError(error); return }

      setSuggestions((prev) => [
        { id: data.id, name: name.trim(), description: description.trim() || null, status: "pending", createdAt: new Date() },
        ...prev,
      ])
      setName("")
      setDescription("")
      setSuccess(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-1">Suggest a new topic</h2>
        <p className="text-sm text-zinc-500 mb-5">
          Don't see a topic you care about? Suggest it and we'll review it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Topic name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Web3, Game Dev, Design Systems"
              maxLength={60}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of articles would this topic include?"
              maxLength={300}
              rows={3}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-emerald-600 font-medium">Suggestion submitted — thanks!</p>}

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Submitting…" : "Submit suggestion"}
          </button>
        </form>
      </div>

      {/* User's own suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-zinc-900 mb-4">Your suggestions</h2>
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">{s.description}</p>
                  )}
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
