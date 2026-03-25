"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

type Topic = { id: string; name: string; icon: string | null }
type Source = {
  id: string
  name: string
  assignedTopics: Topic[]
}

export function AdminAssignmentsPanel({
  initialSources,
  allTopics,
}: {
  initialSources: Source[]
  allTopics: Topic[]
}) {
  const [sources, setSources] = useState<Source[]>(initialSources)
  const [openPicker, setOpenPicker] = useState<string | null>(null)

  async function assign(sourceId: string, topicId: string) {
    setOpenPicker(null)
    const res = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId, topicId }),
    })
    if (!res.ok) return

    const topic = allTopics.find((t) => t.id === topicId)
    if (!topic) return

    setSources((prev) =>
      prev.map((s) =>
        s.id === sourceId ? { ...s, assignedTopics: [...s.assignedTopics, topic] } : s
      )
    )
  }

  async function unassign(sourceId: string, topicId: string) {
    const res = await fetch("/api/admin/assignments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId, topicId }),
    })
    if (!res.ok) return

    setSources((prev) =>
      prev.map((s) =>
        s.id === sourceId
          ? { ...s, assignedTopics: s.assignedTopics.filter((t) => t.id !== topicId) }
          : s
      )
    )
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => {
        const assignedIds = new Set(source.assignedTopics.map((t) => t.id))
        const available = allTopics.filter((t) => !assignedIds.has(t.id))

        return (
          <div key={source.id} className="rounded-xl border border-zinc-200 bg-white px-5 py-4">
            <p className="text-sm font-semibold text-zinc-900 mb-3">{source.name}</p>

            <div className="flex flex-wrap gap-2">
              {source.assignedTopics.map((t) => (
                <span key={t.id} className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700">
                  <span>{t.icon}</span>
                  {t.name}
                  <button
                    onClick={() => unassign(source.id, t.id)}
                    className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-zinc-300/60 hover:bg-zinc-300 transition-colors ml-0.5"
                  >
                    <X className="w-2.5 h-2.5 text-zinc-600" />
                  </button>
                </span>
              ))}

              {/* Add topic picker */}
              <div className="relative">
                <button
                  onClick={() => setOpenPicker(openPicker === source.id ? null : source.id)}
                  className="flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add topic
                </button>

                {openPicker === source.id && (
                  <div className="absolute top-full left-0 mt-1.5 w-48 rounded-xl border border-zinc-200 bg-white shadow-lg z-10 py-1 overflow-hidden">
                    {available.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-zinc-400">All topics assigned</p>
                    ) : (
                      available.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => assign(source.id, t.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          <span>{t.icon}</span>
                          {t.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
