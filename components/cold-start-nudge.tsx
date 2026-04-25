"use client"

import Link from "next/link"

export function ColdStartNudge({ topicCount }: { topicCount: number }) {
  const needed = 3 - topicCount

  return (
    <div>
      <p className="text-sm text-stone-500 dark:text-[#8A95A7]">
        Add <span className="font-medium text-stone-700 dark:text-[#B8C0CC]">{needed} more topic{needed === 1 ? "" : "s"}</span> — the ranking gets sharper the more signals it has to work with.
      </p>
      <Link
        href="/discover"
        className="mt-2 inline-block text-sm text-stone-600 dark:text-[#B8C0CC] underline underline-offset-2 hover:text-stone-800 dark:hover:text-[#F0EDE6] transition-colors"
      >
        Browse topics →
      </Link>
    </div>
  )
}
