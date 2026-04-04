"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import type { ReadingInsightsData } from "@/lib/db/queries/insights"

export function ReadingInsights({
  insights,
  bookmarkCount,
}: {
  insights: ReadingInsightsData
  bookmarkCount: number
}) {
  if (insights.totalReads === 0) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-sm text-stone-400">Start reading articles to see your insights here.</p>
      </div>
    )
  }

  const maxCount = Math.max(...insights.topicReadCounts.map((t) => t.count), 1)

  return (
    <div>
      {/* Stats strip */}
      <div className="grid grid-cols-3 divide-x divide-stone-100 dark:divide-[#1E2A3A]/60 border-b border-stone-100 dark:border-[#1E2A3A]/60">
        {[
          { value: insights.readLast7Days, label: "This week" },
          { value: insights.readLast30Days, label: "This month" },
          { value: insights.totalReads, label: "All time" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center py-5 gap-0.5">
            <span className="text-2xl font-bold text-stone-900 dark:text-[#F0EDE6]">{value}</span>
            <span className="text-xs text-stone-400 dark:text-[#6B7585]">{label}</span>
          </div>
        ))}
      </div>

      {/* Topic breakdown */}
      {insights.topicReadCounts.length > 0 && (
        <div className="px-6 py-5 border-b border-stone-100">
          <p className="text-xs font-semibold text-stone-400 dark:text-[#6B7585] uppercase tracking-widest mb-4">
            Topics this month
          </p>
          <div className="flex flex-col gap-3">
            {insights.topicReadCounts.slice(0, 5).map((t, i) => (
              <motion.div
                key={t.topicId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <span className="text-base leading-none w-5 flex-shrink-0">{t.icon ?? "📄"}</span>
                <span className="text-xs font-medium text-stone-600 dark:text-[#B8C0CC] w-24 truncate flex-shrink-0">{t.name}</span>
                <div className="flex-1 h-2 rounded-full bg-stone-100 dark:bg-[#1E2533] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(t.count / maxCount) * 100}%` }}
                    transition={{ delay: i * 0.05 + 0.1, duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-semibold text-stone-500 dark:text-[#B8C0CC] w-6 text-right flex-shrink-0">
                  {t.count}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Top source + most-read topic */}
      {(insights.topTopicName || insights.mostReadSourceName) && (
        <div className="px-6 py-5 border-b border-stone-100 dark:border-[#1E2A3A]/60 flex flex-col gap-2.5">
          {insights.topTopicName && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 dark:text-[#6B7585]">Top topic this month</span>
              <span className="text-xs font-semibold text-stone-700 dark:text-[#C8C4BC] flex items-center gap-1.5">
                {insights.topTopicIcon && <span>{insights.topTopicIcon}</span>}
                {insights.topTopicName}
              </span>
            </div>
          )}
          {insights.mostReadSourceName && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 dark:text-[#6B7585]">Top source this month</span>
              <span className="text-xs font-semibold text-stone-700 dark:text-[#C8C4BC]">{insights.mostReadSourceName}</span>
            </div>
          )}
        </div>
      )}

      {/* Ignored topics */}
      {insights.ignoredTopics.length > 0 && (
        <div className="px-6 py-5">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium text-stone-600">
              {insights.ignoredTopics.length === 1
                ? "You haven't read anything from this topic in 30 days"
                : `${insights.ignoredTopics.length} topics you haven't read in 30 days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.ignoredTopics.map((t) => (
              <Link
                key={t.id}
                href={`/discover?topic=${t.slug}`}
                className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-colors"
              >
                {t.icon && <span>{t.icon}</span>}
                {t.name}
              </Link>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-3">
            Not interested?{" "}
            <Link href="/profile?tab=topics" className="text-amber-600 hover:underline underline-offset-2">
              Update your topics
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
