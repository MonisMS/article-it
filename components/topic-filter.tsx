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
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        onClick={() => select("all")}
        className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${active === "all"
            ? "bg-zinc-900 text-white"
            : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"
          }`}
      >
        All topics
      </button>
      {topics.map((t) => (
        <button
          key={t.slug}
          onClick={() => select(t.slug)}
          className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${active === t.slug
              ? "bg-zinc-900 text-white"
              : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
        >
          <span>{t.icon}</span>
          {t.name}
        </button>
      ))}
    </div>
  )
}
