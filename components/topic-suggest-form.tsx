"use client"

import { useState } from "react"
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { SuggestionRow } from "@/lib/db/queries/suggestions"
import { timeAgo } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending:  { label: "Under review", icon: Clock,         className: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved",     icon: CheckCircle2,  className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Not added",    icon: XCircle,       className: "bg-stone-100 text-stone-500 border-stone-200" },
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
      setTimeout(() => setSuccess(false), 5000)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-[#6B7585] uppercase tracking-wide mb-2">
              Topic name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setSuccess(false) }}
              placeholder="e.g. Web3, Game Dev, Design Systems"
              maxLength={60}
              className="w-full rounded-xl border border-stone-200 dark:border-[#1E2A3A] px-4 py-3 text-sm text-stone-900 dark:text-[#F0EDE6] placeholder:text-stone-400 dark:placeholder:text-[#6B7585] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all bg-stone-50 dark:bg-[#1E2533] focus:bg-white dark:focus:bg-[#252F3F]"
            />
            <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-1.5">{name.length}/60 characters</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-[#6B7585] uppercase tracking-wide mb-2">
              Description <span className="text-stone-400 dark:text-[#6B7585] font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of articles would this topic include? The more context, the better."
              maxLength={300}
              rows={3}
              className="w-full rounded-xl border border-stone-200 dark:border-[#1E2A3A] px-4 py-3 text-sm text-stone-900 dark:text-[#F0EDE6] placeholder:text-stone-400 dark:placeholder:text-[#6B7585] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none bg-stone-50 dark:bg-[#1E2533] focus:bg-white dark:focus:bg-[#252F3F]"
            />
            <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-1.5">{description.length}/300 characters</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-red-500 flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.p>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm font-medium text-emerald-700">
                  Suggestion submitted — thanks for contributing!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Submitting…" : "Submit suggestion"}
          </button>
        </form>
      </div>

      {/* Past suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-sm font-semibold text-stone-700 dark:text-[#C8C4BC] mb-3">Your suggestions</h2>
            <div className="flex flex-col gap-2.5">
              {suggestions.map((s, i) => {
                const config = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.pending
                const StatusIcon = config.icon
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-5 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6]">{s.name}</p>
                      {s.description && (
                        <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5 line-clamp-1">{s.description}</p>
                      )}
                      <p className="text-xs text-stone-300 dark:text-[#6B7585]/70 mt-1">{timeAgo(s.createdAt)}</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
