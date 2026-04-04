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
    <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <button
        onClick={() => select("all")}
        className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all active:scale-95 ${
          active === "all"
            ? "bg-amber-500 text-white border border-amber-500"
            : "bg-white dark:bg-[#161C26] border border-stone-200 dark:border-[#1E2A3A] text-stone-600 dark:text-[#B8C0CC] hover:border-amber-300 dark:hover:border-[#E8A838]/50 hover:text-stone-900 dark:hover:text-[#F0EDE6]"
        }`}
      >
        All topics
      </button>
      {topics.map((t) => (
        <button
          key={t.slug}
          onClick={() => select(t.slug)}
          className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all active:scale-95 ${
            active === t.slug
              ? "bg-amber-500 text-white border border-amber-500"
              : "bg-white dark:bg-[#161C26] border border-stone-200 dark:border-[#1E2A3A] text-stone-600 dark:text-[#B8C0CC] hover:border-amber-300 dark:hover:border-[#E8A838]/50 hover:text-stone-900 dark:hover:text-[#F0EDE6]"
          }`}
        >
          <span>{t.icon}</span>
          {t.name}
        </button>
      ))}
    </div>
  )
}
