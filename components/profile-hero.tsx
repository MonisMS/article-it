"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Bookmark, Layers, Zap } from "lucide-react"

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileHero({
  name,
  email,
  plan,
  totalReads,
  bookmarkCount,
  topicCount,
}: {
  name: string
  email: string
  plan: string
  totalReads: number
  bookmarkCount: number
  topicCount: number
}) {
  const isPro = plan === "pro"

  const stats = [
    { icon: BookOpen, value: totalReads, label: "articles read" },
    { icon: Bookmark, value: bookmarkCount, label: "bookmarked" },
    { icon: Layers, value: topicCount, label: "topics" },
  ]

  return (
    <div className="bg-gradient-to-b from-stone-50 dark:from-[#161C26] to-white dark:to-[#0D1117] border-b border-stone-200 dark:border-[#1E2A3A]">
      <div className="relative px-4 sm:px-6 pt-10 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end gap-5"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
              <span className="text-2xl font-bold text-white">{initials(name)}</span>
            </div>
            {isPro && (
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                <Zap className="w-3 h-3 text-white fill-white" />
              </div>
            )}
          </div>

          {/* Name + email + plan */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-stone-900 dark:text-[#F0EDE6] tracking-tight">{name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isPro
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-stone-100 text-stone-500 border border-stone-200"
              }`}>
                {isPro ? "Pro" : "Free"}
              </span>
            </div>
            <p className="text-sm text-stone-400 dark:text-[#6B7585] mt-0.5">{email}</p>
            {!isPro && (
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
              >
                <Zap className="w-3 h-3" />
                Upgrade to Pro
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-6 mt-6 pt-6 border-t border-stone-200 dark:border-[#1E2A3A]"
        >
          {stats.map(({ icon: Icon, value, label }, i) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-stone-400 dark:text-[#6B7585]" />
              <span className="text-sm font-bold text-stone-900 dark:text-[#F0EDE6]">{value}</span>
              <span className="text-xs text-stone-400 dark:text-[#6B7585] hidden sm:block">{label}</span>
              {i < stats.length - 1 && <div className="w-px h-3.5 bg-stone-200 dark:bg-[#1E2A3A] ml-4 hidden sm:block" />}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
