"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { TopicIcon } from "@/components/topic-icon"

type Topic = { id: string; name: string; slug: string; icon: string | null }
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

  if (sources.length === 0) {
    return <p className="text-sm text-stone-400 dark:text-[#6B7585] py-4">No sources yet — add some in the RSS Sources tab first.</p>
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => {
        const assignedIds = new Set(source.assignedTopics.map((t) => t.id))
        const available = allTopics.filter((t) => !assignedIds.has(t.id))

        return (
          <div key={source.id} className="rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-5 py-4">
            <p className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6] mb-3">{source.name}</p>

            <div className="flex flex-wrap gap-2">
              {source.assignedTopics.map((t) => (
                <span key={t.id} className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700">
                  <TopicIcon slug={t.slug} size={12} className="text-stone-500" />
                  {t.name}
                  <button
                    onClick={() => unassign(source.id, t.id)}
                    className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-stone-300/60 dark:bg-[#2D3B4F] hover:bg-stone-300 dark:hover:bg-[#3D4B5F] transition-colors ml-0.5"
                  >
                    <X className="w-2.5 h-2.5 text-stone-600 dark:text-[#B8C0CC]" />
                  </button>
                </span>
              ))}

              {/* Add topic picker */}
              <div className="relative">
                <button
                  onClick={() => setOpenPicker(openPicker === source.id ? null : source.id)}
                  className="flex items-center gap-1 rounded-full border border-dashed border-stone-300 dark:border-[#2D3B4F] px-3 py-1.5 text-xs font-medium text-stone-500 dark:text-[#6B7585] hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500/50 dark:hover:text-amber-400 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add topic
                </button>

                {openPicker === source.id && (
                  <div className="absolute top-full left-0 mt-1.5 w-48 rounded-xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] shadow-lg dark:shadow-black/30 z-10 py-1 overflow-hidden">
                    {available.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-stone-400 dark:text-[#6B7585]">All topics assigned</p>
                    ) : (
                      available.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => assign(source.id, t.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <TopicIcon slug={t.slug} size={14} className="text-stone-400" />
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
