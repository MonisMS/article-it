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
      <header className="border-b border-stone-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-stone-900">
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-stone-900 text-white">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          ArticleIt
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 rounded-full bg-amber-500" />
            <div className="w-16 h-1.5 rounded-full bg-stone-200" />
          </div>
          <span className="text-xs text-stone-400 font-medium">1 of 2</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-stone-900 to-stone-600 bg-clip-text text-transparent">
              What are you interested in?
            </h1>
            <p className="mt-2 text-stone-500 text-sm">
              Pick as many as you like. We&apos;ll build your feed around these.
            </p>
          </div>

          {/* Topics grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topics.map((topic) => {
                const isSelected = selected.has(topic.id)
                return (
                  <button
                    key={topic.id}
                    onClick={() => toggle(topic.id)}
                    className={`relative flex flex-col items-center text-center rounded-2xl px-4 py-6 overflow-hidden transition-all duration-200 cursor-pointer
                      ${isSelected
                        ? "border-2 border-amber-500 bg-amber-50 shadow-md shadow-amber-100/50"
                        : "border border-stone-200 bg-white hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/50"
                      }`}
                  >
                    <span className="text-3xl mb-3">{topic.icon}</span>
                    <span className="text-sm font-semibold text-stone-800">{topic.name}</span>
                    {topic.description && (
                      <span className="text-xs text-stone-500 mt-1 line-clamp-2">{topic.description}</span>
                    )}
                    {isSelected && (
                      <span className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
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
            <span className="inline-flex items-center gap-1.5 bg-stone-100 px-3 py-1 rounded-full text-xs font-medium text-stone-600">
              {selected.size === 0
                ? "No topics selected"
                : `${selected.size} topic${selected.size === 1 ? "" : "s"} selected`}
            </span>
            <button
              onClick={handleContinue}
              disabled={saving || selected.size === 0}
              className="flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving
                ? "Saving…"
                : selected.size === 0
                  ? "Continue →"
                  : `Continue with ${selected.size} topic${selected.size === 1 ? "" : "s"} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
