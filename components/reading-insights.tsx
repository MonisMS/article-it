"use client"

import Link from "next/link"
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
      <div className="rounded-2xl border border-stone-200 bg-white px-6 py-9 text-center dark:border-lp-border dark:bg-lp-surface">
        <p className="text-sm text-stone-500 dark:text-lp-text-muted">Start reading articles to see your insights here.</p>
      </div>
    )
  }

  const maxCount = Math.max(...insights.topicReadCounts.map((t) => t.count), 1)

  const topicsThisMonth = insights.topicReadCounts.slice(0, 7)
  const ignoredCount = insights.ignoredTopics.length

  const percent = (count: number) => {
    return Math.max(6, Math.round((count / maxCount) * 100))
  }

  return (
    <div className="space-y-5">
      {/* Main content */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: main reading activity */}
        <section className="lg:col-span-8 rounded-2xl border border-stone-200 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-lp-text">Topics this month</h2>
              <p className="mt-1 text-xs text-stone-500 dark:text-lp-text-muted">Your most-read topics over the last 30 days.</p>
            </div>
            <div className="text-[11px] text-stone-500 dark:text-lp-text-muted">Last 30 days</div>
          </div>

          {topicsThisMonth.length > 0 ? (
            <div className="mt-4 space-y-3">
              {topicsThisMonth.map((t) => (
                <div key={t.topicId} className="flex items-center gap-2.5">
                  <span className="w-5 shrink-0 text-base leading-none">{t.icon ?? "📄"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium text-stone-800 dark:text-lp-text">{t.name}</span>
                      <span className="shrink-0 text-xs font-semibold text-stone-600 tabular-nums dark:text-lp-text-muted">{t.count}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-lp-elevated">
                      <div
                        className="h-full rounded-full bg-stone-400/70 dark:bg-lp-text-subtle"
                        style={{ width: `${percent(t.count)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-lp-border dark:bg-lp-elevated dark:text-lp-text-muted">
              No topic breakdown yet.
            </div>
          )}

          {/* Optional secondary reading behavior block (supported by existing data) */}
          <div className="mt-5 border-t border-stone-200 pt-4 dark:border-lp-border">
            <h3 className="text-xs font-semibold text-stone-900 dark:text-lp-text">Reading activity</h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { value: insights.readLast7Days, label: "This week" },
                { value: insights.readLast30Days, label: "This month" },
                { value: insights.totalReads, label: "All time" },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 dark:border-lp-border dark:bg-lp-elevated">
                  <div className="text-sm font-semibold text-stone-900 tabular-nums leading-none dark:text-lp-text">{value}</div>
                  <div className="mt-1 text-[11px] text-stone-500 dark:text-lp-text-muted">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right: insights / summary */}
        <aside className="lg:col-span-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
          <h2 className="text-xs font-semibold text-stone-900 dark:text-lp-text">Summary</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-lp-text-muted">A quick snapshot of recent reading.</p>

          <div className="mt-4 space-y-2.5">
            {insights.topTopicName && (
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] text-stone-500 dark:text-lp-text-muted">Top topic</div>
                <div className="text-xs font-medium text-stone-800 dark:text-lp-text flex items-center gap-1.5">
                  {insights.topTopicIcon && <span>{insights.topTopicIcon}</span>}
                  <span className="truncate">{insights.topTopicName}</span>
                </div>
              </div>
            )}

            {insights.mostReadSourceName && (
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] text-stone-500 dark:text-lp-text-muted">Top source</div>
                <div className="text-xs font-medium text-stone-800 dark:text-lp-text truncate">{insights.mostReadSourceName}</div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] text-stone-500 dark:text-lp-text-muted">Bookmarks</div>
              <div className="text-xs font-medium text-stone-800 tabular-nums dark:text-lp-text">{bookmarkCount}</div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] text-stone-500 dark:text-lp-text-muted">Pattern</div>
              <div className="text-xs font-medium text-stone-800 tabular-nums dark:text-lp-text">{insights.readLast7Days} reads / week</div>
            </div>

            {ignoredCount > 0 && (
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] text-stone-500 dark:text-lp-text-muted">Quiet topics</div>
                <div className="text-xs font-medium text-stone-800 tabular-nums dark:text-lp-text">{ignoredCount}</div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Secondary notice area */}
      {ignoredCount > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-stone-50/60 px-5 py-4 dark:border-lp-border dark:bg-lp-surface">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-stone-400 dark:text-lp-text-subtle" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-stone-900 dark:text-lp-text">Topics to revisit</div>
              <p className="mt-1 text-xs text-stone-500 dark:text-lp-text-muted">
                {ignoredCount === 1
                  ? "You have not read anything from this topic in 30 days."
                  : `You have not read anything from ${ignoredCount} topics in 30 days.`}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {insights.ignoredTopics.map((t) => (
              <Link
                key={t.id}
                href={`/discover?topic=${t.slug}`}
                className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-lp-border dark:bg-lp-surface dark:text-lp-text-muted dark:hover:bg-lp-elevated dark:hover:text-lp-text"
              >
                {t.icon && <span>{t.icon}</span>}
                {t.name}
              </Link>
            ))}
          </div>

          <p className="mt-3 text-xs text-stone-500 dark:text-lp-text-muted">
            Want to adjust this list?{" "}
            <Link href="/profile?tab=topics" className="text-stone-900 underline underline-offset-2 dark:text-lp-text">
              Update your topics
            </Link>
          </p>
        </section>
      )}
    </div>
  )
}
