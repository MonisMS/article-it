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
    params.delete("page")
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => select("all")}
        className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${active === "all" ? "border-stone-300 bg-stone-900 text-white dark:border-[#E8A838] dark:bg-[#F0EDE6] dark:text-[#0D1117]" : "border-stone-200/80 bg-white/80 text-stone-500 hover:border-stone-300 hover:text-stone-800 dark:border-[#1E2A3A] dark:bg-[#121925] dark:text-[#8A95A7] dark:hover:border-[#2A3547] dark:hover:text-[#F0EDE6]"}`}
      >
        All
      </button>
      {topics.map((topic) => (
        <button
          key={topic.slug}
          onClick={() => select(topic.slug)}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${active === topic.slug ? "border-stone-300 bg-stone-900 text-white dark:border-[#E8A838] dark:bg-[#F0EDE6] dark:text-[#0D1117]" : "border-stone-200/80 bg-white/80 text-stone-500 hover:border-stone-300 hover:text-stone-800 dark:border-[#1E2A3A] dark:bg-[#121925] dark:text-[#8A95A7] dark:hover:border-[#2A3547] dark:hover:text-[#F0EDE6]"}`}
        >
          <span className="flex items-center gap-1.5">
            {topic.icon && <span className="text-sm leading-none">{topic.icon}</span>}
            <span>{topic.name}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
