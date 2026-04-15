"use client"

import type { StreakData } from "@/lib/db/queries/streak"

export function ReadingStreak({ data }: { data: StreakData }) {
  const { currentStreak, weeklyCount } = data
  if (currentStreak === 0 && weeklyCount === 0) return null

  return (
    <div className="px-4 sm:px-6 mb-4">
      <p className="text-xs text-stone-400 dark:text-[#6B7585]">
        {currentStreak > 0 ? (
          <>🔥 <span className="font-medium text-stone-500 dark:text-[#8A95A7]">{currentStreak}-day streak</span></>
        ) : null}
        {currentStreak > 0 && weeklyCount > 0 && <span className="mx-1.5 text-stone-300 dark:text-[#2A3547]">·</span>}
        {weeklyCount > 0 && (
          <span className="font-medium text-stone-500 dark:text-[#8A95A7]">{weeklyCount}/7 days this week</span>
        )}
      </p>
    </div>
  )
}