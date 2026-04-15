"use client"

import Link from "next/link"

export function ColdStartNudge({ topicCount }: { topicCount: number }) {
  const needed = 3 - topicCount

  return (
    <div>
      <p className="text-sm text-stone-500 dark:text-[#8A95A7]">
        Follow <span className="font-medium text-stone-700 dark:text-[#B8C0CC]">{needed} more</span> topic{needed === 1 ? "" : "s"} for a richer stream.
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
