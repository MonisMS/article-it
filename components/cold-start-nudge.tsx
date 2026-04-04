"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Compass } from "lucide-react"

export function ColdStartNudge({ topicCount }: { topicCount: number }) {
  const needed = 3 - topicCount

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-4 sm:mx-6 mb-5 rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-4 py-4 flex items-center gap-4"
    >
      <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
        <Compass className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800 dark:text-[#F0EDE6]">
          Follow {needed} more topic{needed === 1 ? "" : "s"} for a better feed
        </p>
        <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5">
          More topics means more variety and a richer daily queue.
        </p>
      </div>
      <Link
        href="/discover"
        className="flex-shrink-0 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-4 py-2 transition-colors"
      >
        Explore
      </Link>
    </motion.div>
  )
}
