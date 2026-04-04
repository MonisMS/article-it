"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function NewArticlesBanner({ count, since }: { count: number; since: Date }) {
  const hoursAgo = Math.round((Date.now() - since.getTime()) / 3600000)
  const timeLabel =
    hoursAgo < 1 ? "the last hour" :
    hoursAgo < 24 ? `the last ${hoursAgo}h` :
    hoursAgo < 48 ? "yesterday" :
    `the last ${Math.round(hoursAgo / 24)} days`

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-4 sm:mx-6 mb-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3 flex items-center gap-3"
    >
      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      </span>
      <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
        <span className="font-bold">{count} new article{count === 1 ? "" : "s"}</span>
        {" "}arrived since {timeLabel}
      </p>
    </motion.div>
  )
}
