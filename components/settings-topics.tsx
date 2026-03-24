"use client"

import { useState } from "react"
import { X, Plus, Loader2 } from "lucide-react"

type Topic = { id: string; name: string; slug: string; icon: string | null }

export function SettingsTopics({
  allTopics,
  followedIds,
}: {
  allTopics: Topic[]
  followedIds: string[]
}) {
  const [followed, setFollowed] = useState<Set<string>>(new Set(followedIds))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function add(id: string) {
    setFollowed((prev) => new Set([...prev, id]))
    setSaved(false)
  }

  function remove(id: string) {
    setFollowed((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setSaved(false)
  }

  const followedTopics = allTopics.filter((t) => followed.has(t.id))
  const availableTopics = allTopics.filter((t) => !followed.has(t.id))

  async function save() {
    if (followed.size === 0) return
    setSaving(true)
    await fetch("/api/user/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicIds: Array.from(followed) }),
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-5">
      {/* Following section */}
      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Following</p>
        {followedTopics.length === 0 ? (
          <p className="text-sm text-zinc-400 italic">No topics yet — add some below.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {followedTopics.map((t) => (
              <span
                key={t.id}
                className="flex items-center gap-1.5 rounded-full bg-zinc-900 text-white pl-3 pr-2 py-1.5 text-sm font-medium"
              >
                <span className="text-base leading-none">{t.icon}</span>
                {t.name}
                <button
                  onClick={() => remove(t.id)}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors ml-0.5"
                  aria-label={`Remove ${t.name}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add more */}
      {availableTopics.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Add topics</p>
          <div className="flex flex-wrap gap-2">
            {availableTopics.map((t) => (
              <button
                key={t.id}
                onClick={() => add(t.id)}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all"
              >
                <span className="text-base leading-none">{t.icon}</span>
                {t.name}
                <Plus className="w-3 h-3 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-3 pt-1 border-t border-zinc-100">
        <button
          onClick={save}
          disabled={saving || followed.size === 0}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">Saved ✓</span>}
        <span className="ml-auto text-xs text-zinc-400">{followed.size} topic{followed.size === 1 ? "" : "s"}</span>
      </div>
    </div>
  )
}
