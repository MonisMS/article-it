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

  const inputClass = "w-full rounded-lg border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#1E2533] px-3 py-2 text-sm text-stone-900 dark:text-[#F0EDE6] placeholder:text-stone-400 dark:placeholder:text-[#6B7585] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form onSubmit={addTopic} className="rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-5">
        <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6] mb-4">Add topic</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-[#6B7585] mb-1">Name *</label>
            <input value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-[#6B7585] mb-1">Slug *</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-[#6B7585] mb-1">Icon (emoji)</label>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={10} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-[#6B7585] mb-1">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} className={inputClass} />
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button type="submit" disabled={adding || !name || !slug}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 transition-all">
          {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {adding ? "Adding…" : "Add topic"}
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] overflow-hidden">
        {topicList.length === 0 ? (
          <p className="px-5 py-8 text-sm text-stone-400 dark:text-[#6B7585] text-center">No topics yet — add one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 dark:border-[#1E2A3A] bg-stone-50 dark:bg-[#1E2533]/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500 dark:text-[#6B7585]">Topic</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500 dark:text-[#6B7585] hidden sm:table-cell">Slug</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-stone-500 dark:text-[#6B7585]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-[#1E2A3A]">
              {topicList.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50 dark:hover:bg-[#1E2533]/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span className="font-medium text-stone-900 dark:text-[#F0EDE6]">{t.name}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-stone-400 dark:text-[#6B7585] font-mono text-xs hidden sm:table-cell">{t.slug}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleActive(t.id, t.isActive)}
                      disabled={toggling === t.id}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        t.isActive
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                          : "bg-stone-100 dark:bg-[#1E2533] text-stone-500 dark:text-[#6B7585] hover:bg-stone-200 dark:hover:bg-[#252F3F]"
                      }`}
                    >
                      {toggling === t.id ? "…" : t.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
