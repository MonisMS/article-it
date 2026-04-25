"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Plus, X, Zap } from "lucide-react"

type Topic = { id: string; name: string; slug: string; icon: string | null }

const FREE_LIMIT = 5

export function SettingsTopics({
  allTopics,
  followedIds,
  plan = "free",
}: {
  allTopics: Topic[]
  followedIds: string[]
  plan?: string
}) {
  const [followed, setFollowed] = useState<Set<string>>(new Set(followedIds))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFree = plan === "free"
  const atLimit = isFree && followed.size >= FREE_LIMIT

  function add(id: string) {
    if (atLimit) return
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

  const followedTopics = allTopics.filter((topic) => followed.has(topic.id))
  const availableTopics = allTopics.filter((topic) => !followed.has(topic.id))

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
        const { error: message } = await res.json()
        setError(message)
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
      <div className="border-b border-app-border-subtle pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-text-subtle">Topics</p>
        <h3 className="mt-2 text-lg font-semibold text-app-text">Your reading profile</h3>
        <p className="mt-2 text-sm leading-6 text-app-text-muted">
          Choose the subjects that define your feed. Keep the list intentional and easy to maintain.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-app-text-subtle">Following</p>
          {isFree ? (
            <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${atLimit ? "text-amber-600 dark:text-amber-400" : "text-app-text-subtle"}`}>
              {followed.size} / {FREE_LIMIT} topics
            </span>
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-text-subtle">
              {followedTopics.length} topic{followedTopics.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {atLimit && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            <Zap className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              You&apos;ve reached the 5-topic limit on the free plan.{" "}
              <Link href="/upgrade" className="font-medium underline underline-offset-2">Upgrade to Pro</Link>
              {" "}for unlimited topics.
            </span>
          </div>
        )}

        {followedTopics.length === 0 ? (
          <p className="rounded-xl border border-app-border-subtle bg-app-bg px-4 py-3 text-sm text-app-text-subtle">
            No topics yet. Add a few below to shape your feed.
          </p>
        ) : (
          <div className="rounded-[1.25rem] border border-app-border-subtle bg-app-bg">
            <div className="divide-y divide-app-border-subtle">
              {followedTopics.map((topic) => (
                <div key={topic.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="w-7 shrink-0 text-lg leading-none">{topic.icon ?? "*"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-app-text">{topic.name}</div>
                  </div>
                  <button
                    onClick={() => remove(topic.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-app-border px-2.5 py-1.5 text-xs font-medium text-app-text-muted transition-colors hover:bg-app-hover"
                    aria-label={`Remove ${topic.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
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
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-app-text-subtle">Add more</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {availableTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => add(topic.id)}
                disabled={atLimit}
                className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-app-bg px-4 py-3 text-left transition-colors hover:bg-app-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="w-6 shrink-0 text-lg leading-none">{topic.icon ?? "*"}</span>
                  <span className="truncate text-sm font-medium text-app-text">{topic.name}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-app-text-muted">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-app-border-subtle pt-2">
        <button
          onClick={save}
          disabled={saving || followed.size === 0}
          className="flex items-center gap-2 rounded-lg bg-app-accent px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && <span className="text-sm font-medium text-app-accent">Saved</span>}
        {error && (
          error.includes("Upgrade") ? (
            <span className="flex items-center gap-1.5 text-sm text-amber-600">
              <Zap className="h-3.5 w-3.5 shrink-0" />
              {error.split(".")[0]}.{" "}
              <Link href="/upgrade" className="font-medium underline underline-offset-2">Upgrade to Pro</Link>
            </span>
          ) : (
            <span className="text-sm text-red-500">{error}</span>
          )
        )}
      </div>
    </div>
  )
}
