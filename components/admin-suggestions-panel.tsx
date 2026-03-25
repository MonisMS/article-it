"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

type Suggestion = {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: Date
  user: { name: string; email: string }
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:  { label: "Pending",  className: "bg-amber-50 text-amber-700" },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", className: "bg-zinc-100 text-zinc-500" },
}

export function AdminSuggestionsPanel({ initialSuggestions }: { initialSuggestions: Suggestion[] }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<Record<string, string>>({})

  async function review(id: string, action: "approve" | "reject") {
    setLoading(id)
    setError((prev) => ({ ...prev, [id]: "" }))
    try {
      const res = await fetch(`/api/admin/suggestions/${id}/${action}`, { method: "POST" })
      const { error: err } = await res.json()
      if (err) {
        setError((prev) => ({ ...prev, [id]: err }))
        return
      }
      setSuggestions((prev) =>
        prev.map((s) => s.id === id ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s)
      )
    } catch {
      setError((prev) => ({ ...prev, [id]: "Something went wrong." }))
    } finally {
      setLoading(null)
    }
  }

  if (suggestions.length === 0) {
    return <p className="text-sm text-zinc-400 py-4">No suggestions yet.</p>
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50">
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Topic</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 hidden sm:table-cell">Submitted by</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Status</th>
            <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {suggestions.map((s) => {
            const statusConfig = STATUS_LABELS[s.status] ?? { label: s.status, className: "bg-zinc-100 text-zinc-500" }
            const isPending = s.status === "pending"
            return (
              <tr key={s.id}>
                <td className="px-5 py-3">
                  <p className="font-medium text-zinc-900">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-zinc-400 mt-0.5 max-w-xs truncate">{s.description}</p>
                  )}
                  {error[s.id] && (
                    <p className="text-xs text-red-500 mt-1">{error[s.id]}</p>
                  )}
                </td>
                <td className="px-5 py-3 hidden sm:table-cell">
                  <p className="text-zinc-900">{s.user.name}</p>
                  <p className="text-xs text-zinc-400">{s.user.email}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}>
                    {statusConfig.label}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {isPending && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => review(s.id, "approve")}
                        disabled={loading === s.id}
                        className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        {loading === s.id && <Loader2 className="w-3 h-3 animate-spin" />}
                        Approve
                      </button>
                      <button
                        onClick={() => review(s.id, "reject")}
                        disabled={loading === s.id}
                        className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
