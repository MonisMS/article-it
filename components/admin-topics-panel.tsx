"use client"

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { slugify } from "@/lib/utils"

type Topic = {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  isActive: boolean
}

export function AdminTopicsPanel({ initialTopics }: { initialTopics: Topic[] }) {
  const [topicList, setTopicList] = useState<Topic[]>(initialTopics)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [icon, setIcon] = useState("")
  const [description, setDescription] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  function handleNameChange(val: string) {
    setName(val)
    setSlug(slugify(val))
  }

  async function addTopic(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, icon: icon || undefined, description: description || undefined }),
      })
      const { data, error } = await res.json()
      if (error) { setError(error); return }
      setTopicList((prev) => [data, ...prev])
      setName(""); setSlug(""); setIcon(""); setDescription("")
    } catch {
      setError("Something went wrong.")
    } finally {
      setAdding(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    setToggling(id)
    try {
      const res = await fetch(`/api/admin/topics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      })
      const { data } = await res.json()
      if (data) setTopicList((prev) => prev.map((t) => t.id === id ? { ...t, isActive: data.isActive } : t))
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form onSubmit={addTopic} className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm font-semibold text-zinc-900 mb-4">Add topic</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Name *</label>
            <input value={name} onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Slug *</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Icon (emoji)</label>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={10}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button type="submit" disabled={adding || !name || !slug}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-40 transition-all">
          {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {adding ? "Adding…" : "Add topic"}
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Topic</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 hidden sm:table-cell">Slug</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {topicList.map((t) => (
              <tr key={t.id}>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2">
                    <span>{t.icon}</span>
                    <span className="font-medium text-zinc-900">{t.name}</span>
                  </span>
                </td>
                <td className="px-5 py-3 text-zinc-400 font-mono text-xs hidden sm:table-cell">{t.slug}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => toggleActive(t.id, t.isActive)}
                    disabled={toggling === t.id}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      t.isActive
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    }`}
                  >
                    {toggling === t.id ? "…" : t.isActive ? "Active" : "Inactive"}
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
