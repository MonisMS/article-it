"use client"

import { useRouter, useSearchParams } from "next/navigation"

type Topic = {
  id: string
  name: string
  slug: string
  icon: string | null
}

export function TopicFilter({ topics }: { topics: Topic[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get("topic") ?? "all"

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === "all") {
      params.delete("topic")
    } else {
      params.set("topic", slug)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 px-4 sm:px-6 pb-4">
      <button
        onClick={() => select("all")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all active:scale-95 ${
          active === "all"
            ? "bg-app-text text-white"
            : "bg-app-surface border border-app-border text-app-text-muted hover:border-app-text hover:text-app-text"
        }`}
      >
        All topics
      </button>
      {topics.map((t) => (
        <button
          key={t.slug}
          onClick={() => select(t.slug)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all active:scale-95 ${
            active === t.slug
              ? "bg-app-text text-white"
              : "bg-app-surface border border-app-border text-app-text-muted hover:border-app-text hover:text-app-text"
          }`}
        >
          <span>{t.icon}</span>
          {t.name}
        </button>
      ))}
    </div>
  )
}
