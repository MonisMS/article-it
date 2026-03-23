"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Check, Loader2 } from "lucide-react"

type Topic = {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
}

export default function OnboardingPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then(({ data }) => { if (data) setTopics(data) })
      .finally(() => setLoading(false))
  }, [])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleContinue() {
    if (selected.size === 0) {
      setError("Pick at least one topic to continue.")
      return
    }
    setError("")
    setSaving(true)

    const res = await fetch("/api/user/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicIds: Array.from(selected) }),
    })
    const { error } = await res.json()

    if (error) {
      setError(error)
      setSaving(false)
      return
    }

    router.push("/onboarding/schedule")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-zinc-900">
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 text-white">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          ArticleIt
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="font-medium text-zinc-900">Step 1</span>
          <span>/</span>
          <span>2</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-zinc-900">What are you interested in?</h1>
            <p className="mt-2 text-zinc-500 text-sm">
              Pick as many as you like. We&apos;ll build your feed around these.
            </p>
          </div>

          {/* Topics grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topics.map((topic) => {
                const isSelected = selected.has(topic.id)
                return (
                  <button
                    key={topic.id}
                    onClick={() => toggle(topic.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border px-4 py-5 text-center transition-all cursor-pointer
                      ${isSelected
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:shadow-sm"
                      }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 flex items-center justify-center w-4 h-4 rounded-full bg-white">
                        <Check className="w-2.5 h-2.5 text-zinc-900" />
                      </span>
                    )}
                    <span className="text-2xl">{topic.icon}</span>
                    <span className="text-sm font-medium">{topic.name}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}

          {/* Footer */}
          <div className="mt-10 flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              {selected.size === 0
                ? "No topics selected"
                : `${selected.size} topic${selected.size === 1 ? "" : "s"} selected`}
            </p>
            <button
              onClick={handleContinue}
              disabled={saving || selected.size === 0}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
