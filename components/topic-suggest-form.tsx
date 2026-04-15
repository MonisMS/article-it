"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react"
import type { SuggestionRow } from "@/lib/db/queries/suggestions"
import { timeAgo } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: "Under review", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Not added", icon: XCircle, className: "bg-stone-100 text-stone-500 border-stone-200" },
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

      if (error) {
        setError(error)
        return
      }

      setSuggestions((prev) => [
        { id: data.id, name: name.trim(), description: description.trim() || null, status: "pending", createdAt: new Date() },
        ...prev,
      ])
      setName("")
      setDescription("")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-stone-200/80 bg-white p-6 dark:border-[#1E2A3A] dark:bg-[#161C26]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-b border-stone-200/80 pb-4 dark:border-[#1E2A3A]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
              New suggestion
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-[#B8C0CC]">
              Keep it specific. A tight topic with a clear description is easier to review and add.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-[#6B7585]">
              Topic name
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSuccess(false)
              }}
              placeholder="e.g. Design systems"
              maxLength={60}
              className="w-full rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/15 dark:border-[#1E2A3A] dark:bg-[#1E2533] dark:text-[#F0EDE6] dark:placeholder:text-[#6B7585] dark:focus:bg-[#252F3F]"
            />
            <p className="mt-1.5 text-xs text-stone-400 dark:text-[#6B7585]">{name.length}/60</p>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-[#6B7585]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kinds of articles belong here?"
              maxLength={300}
              rows={3}
              className="w-full resize-none rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/15 dark:border-[#1E2A3A] dark:bg-[#1E2533] dark:text-[#F0EDE6] dark:placeholder:text-[#6B7585] dark:focus:bg-[#252F3F]"
            />
            <p className="mt-1.5 text-xs text-stone-400 dark:text-[#6B7585]">{description.length}/300</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm text-red-500"
              >
                <XCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.p>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700">Suggestion submitted. Thanks for contributing.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#F0EDE6] dark:text-[#0D1117]"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {submitting ? "Submitting..." : "Submit suggestion"}
          </button>
        </form>
      </section>

      {suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-[#C8C4BC]">Your suggestions</h2>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => {
              const config = STATUS_CONFIG[suggestion.status] ?? STATUS_CONFIG.pending
              const StatusIcon = config.icon
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-stone-200/80 bg-white px-5 py-4 dark:border-[#1E2A3A] dark:bg-[#161C26]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6]">{suggestion.name}</p>
                    {suggestion.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-stone-400 dark:text-[#6B7585]">{suggestion.description}</p>
                    )}
                    <p className="mt-1 text-xs text-stone-300 dark:text-[#6B7585]/70">{timeAgo(suggestion.createdAt)}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
