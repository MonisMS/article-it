"use client"

import { useState } from "react"
import Link from "next/link"
import { X, Plus, Loader2, Zap } from "lucide-react"

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
  const [error, setError] = useState<string | null>(null)

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
    setError(null)
    try {
      const res = await fetch("/api/user/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicIds: Array.from(followed) }),
      })
      if (res.status === 403) {
        const { error: msg } = await res.json()
        setError(msg)
        return
      }
      if (!res.ok) throw new Error("Failed to save")
      setSaved(true)
    } catch {
      setError("Couldn't save topics. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-app-text-subtle uppercase tracking-widest mb-3">Following</p>
        {followedTopics.length === 0 ? (
          <p className="text-sm text-app-text-subtle italic">No topics yet — add some below.</p>
        ) : (
          <div className="rounded-xl border border-app-border-subtle bg-app-bg">
            <div className="divide-y divide-app-border-subtle">
              {followedTopics.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-lg leading-none w-6 shrink-0">{t.icon ?? "📄"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-app-text truncate">{t.name}</div>
                    <div className="text-xs text-app-text-subtle">Following</div>
                  </div>
                  <button
                    onClick={() => remove(t.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-app-border px-2.5 py-1.5 text-xs font-medium text-app-text-muted hover:bg-app-hover transition-colors"
                    aria-label={`Remove ${t.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {availableTopics.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-app-text-subtle uppercase tracking-widest mb-3">Discover more</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableTopics.map((t) => (
              <button
                key={t.id}
                onClick={() => add(t.id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-app-bg px-4 py-3 text-left hover:bg-app-hover transition-colors"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-lg leading-none w-6 shrink-0">{t.icon ?? "📄"}</span>
                  <span className="text-sm font-medium text-app-text truncate">{t.name}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-app-text-muted">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1 border-t border-app-border-subtle">
        <button
          onClick={save}
          disabled={saving || followed.size === 0}
          className="flex items-center gap-2 rounded-lg bg-app-accent text-white text-sm font-semibold px-5 py-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-app-accent font-medium">Saved ✓</span>}
        {error && (
          error.includes("Upgrade") ? (
            <span className="flex items-center gap-1.5 text-sm text-amber-600">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              {error.split(".")[0]}.{" "}
              <Link href="/upgrade" className="underline underline-offset-2 font-medium">Upgrade to Pro</Link>
            </span>
          ) : (
            <span className="text-sm text-red-500">{error}</span>
          )
        )}
        <span className="ml-auto text-xs text-app-text-subtle">{followed.size} topic{followed.size === 1 ? "" : "s"}</span>
      </div>
    </div>
  )
}
