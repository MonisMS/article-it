"use client"

import { motion } from "framer-motion"
import type { StreakData } from "@/lib/db/queries/streak"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

export function ReadingStreak({ data }: { data: StreakData }) {
  const { currentStreak, weeklyCount, weekDays } = data

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-4 sm:mx-6 mb-5 rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-5 py-4 flex items-center gap-6"
    >
      {/* Streak count */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span className="text-2xl leading-none">{currentStreak > 0 ? "🔥" : "💤"}</span>
        <div>
          <p className="text-xl font-bold text-stone-900 dark:text-[#F0EDE6] leading-none">{currentStreak}</p>
          <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5">day streak</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-stone-100 dark:bg-[#1E2A3A] flex-shrink-0" />

      {/* Week grid */}
      <div className="flex-1 min-w-0">
        <div className="flex items-end gap-1.5">
          {weekDays.map((active, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.04, duration: 0.2, ease: "easeOut" }}
                style={{ originY: 1 }}
                className={`w-full rounded-sm transition-colors ${
                  active
                    ? "h-5 bg-amber-400 dark:bg-amber-500"
                    : "h-2 bg-stone-100 dark:bg-[#1E2A3A]"
                }`}
              />
              <span className="text-[10px] text-stone-300 dark:text-[#3A4556] font-medium">{DAY_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-stone-100 dark:bg-[#1E2A3A] flex-shrink-0" />

      {/* Weekly count */}
      <div className="flex-shrink-0 text-right">
        <p className="text-xl font-bold text-stone-900 dark:text-[#F0EDE6] leading-none">{weeklyCount}<span className="text-sm font-normal text-stone-300 dark:text-[#3A4556]">/7</span></p>
        <p className="text-xs text-stone-400 dark:text-[#6B7585] mt-0.5">days this week</p>
      </div>
    </motion.div>
  )
}
