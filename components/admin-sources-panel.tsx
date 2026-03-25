"use client"

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"

type Source = {
  id: string
  name: string
  url: string
  isActive: boolean
  lastFetchedAt: Date | null
}

function formatDate(date: Date | null): string {
  if (!date) return "Never"
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function AdminSourcesPanel({ initialSources }: { initialSources: Source[] }) {
  const [sourceList, setSourceList] = useState<Source[]>(initialSources)
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  async function addSource(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url }),
      })
      const { data, error } = await res.json()
      if (error) { setError(error); return }
      setSourceList((prev) => [data, ...prev])
      setName(""); setUrl("")
    } catch {
      setError("Something went wrong.")
    } finally {
      setAdding(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    setToggling(id)
    try {
      const res = await fetch(`/api/admin/sources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      })
      const { data } = await res.json()
      if (data) setSourceList((prev) => prev.map((s) => s.id === id ? { ...s, isActive: data.isActive } : s))
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form onSubmit={addSource} className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm font-semibold text-zinc-900 mb-4">Add RSS source</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CSS Tricks"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Feed URL *</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} type="url"
              placeholder="https://example.com/feed"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button type="submit" disabled={adding || !name || !url}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-40 transition-all">
          {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {adding ? "Adding…" : "Add source"}
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Source</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 hidden md:table-cell">Last fetched</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sourceList.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3">
                  <p className="font-medium text-zinc-900">{s.name}</p>
                  <p className="text-xs text-zinc-400 truncate max-w-xs">{s.url}</p>
                </td>
                <td className="px-5 py-3 text-zinc-400 text-xs hidden md:table-cell">{formatDate(s.lastFetchedAt)}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => toggleActive(s.id, s.isActive)}
                    disabled={toggling === s.id}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      s.isActive
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    }`}
                  >
                    {toggling === s.id ? "…" : s.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
