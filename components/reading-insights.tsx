"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import type { ReadingInsightsData } from "@/lib/db/queries/insights"

export function ReadingInsights({
  insights,
  digestTotal,
  digestActive,
}: {
  insights: ReadingInsightsData
  digestTotal?: number
  digestActive?: number
}) {
  if (insights.totalReads === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white px-6 py-9 text-center dark:border-lp-border dark:bg-lp-surface">
        <p className="text-sm text-stone-500 dark:text-lp-text-muted">Start reading articles to see your insights here.</p>
      </div>
    )
  }

  const topicsThisMonth = insights.topicReadCounts.slice(0, 7)
  const ignoredCount = insights.ignoredTopics.length

  const maxCount = Math.max(...topicsThisMonth.map((t) => t.count), 1)

  const activityLabel = (count: number) => {
    const ratio = count / maxCount
    if (ratio >= 0.7) return "Frequent"
    if (ratio >= 0.35) return "Occasional"
    return "Quiet lately"
  }

  const digestLabel = () => {
    if (digestTotal === undefined || digestActive === undefined) return null
    if (digestTotal === 0) return "Not set"
    if (digestActive === digestTotal) return `${digestActive} active`
    return `${digestActive} active · ${digestTotal - digestActive} paused`
  }

  return (
    <div className="space-y-5">
      {/* Main content */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: main reading activity */}
        <section className="lg:col-span-8 rounded-2xl border border-stone-200 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
          {/* Reading snapshot */}
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-lp-text">Reading snapshot</h2>
            <p className="mt-1 text-xs text-stone-500 dark:text-lp-text-muted">A simple view of your recent reading cadence.</p>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
              <div className="flex items-baseline gap-2">
                <span className="tabular-nums font-semibold text-stone-900 dark:text-lp-text">{insights.readLast7Days}</span>
                <span className="text-xs text-stone-500 dark:text-lp-text-muted">this week</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="tabular-nums font-semibold text-stone-900 dark:text-lp-text">{insights.readLast30Days}</span>
                <span className="text-xs text-stone-500 dark:text-lp-text-muted">this month</span>
              </div>
            </div>
          </div>

          {/* Reading interests */}
          <div className="mt-6 border-t border-stone-200 pt-5 dark:border-lp-border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-lp-text">Reading interests</h3>
                <p className="mt-1 text-xs text-stone-500 dark:text-lp-text-muted">Your most-read topics over the last 30 days.</p>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-lp-text-muted">Last 30 days</div>
            </div>

            {topicsThisMonth.length > 0 ? (
              <div className="mt-4 divide-y divide-stone-100 dark:divide-lp-border">
                {topicsThisMonth.map((t) => (
                  <div key={t.topicId} className="flex items-center gap-3 py-3">
                    <span className="w-6 shrink-0 text-lg leading-none">{t.icon ?? "📄"}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-medium text-stone-800 dark:text-lp-text">{t.name}</span>
                        <span className="shrink-0 text-xs text-stone-500 dark:text-lp-text-muted">
                          <span className="tabular-nums font-semibold text-stone-700 dark:text-lp-text">{t.count}</span> reads
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-stone-500 dark:text-lp-text-muted">
                        {activityLabel(t.count)}
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
          </div>
        </section>

        {/* Right: insights / summary */}
        <aside className="lg:col-span-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
          <h2 className="text-xs font-semibold text-stone-900 dark:text-lp-text">Summary</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-lp-text-muted">Small, quiet signals about your reading.</p>

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
              <div className="text-[11px] text-stone-500 dark:text-lp-text-muted">Pattern</div>
              <div className="text-xs font-medium text-stone-800 tabular-nums dark:text-lp-text">{insights.readLast7Days} reads / week</div>
            </div>

            {digestLabel() && (
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] text-stone-500 dark:text-lp-text-muted">Digests</div>
                <div className="text-xs font-medium text-stone-800 tabular-nums dark:text-lp-text">{digestLabel()}</div>
              </div>
            )}

            {ignoredCount > 0 && (
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] text-stone-500 dark:text-lp-text-muted">Quiet topics</div>
                <div className="text-xs font-medium text-stone-800 tabular-nums dark:text-lp-text">{ignoredCount}</div>
              </div>
            )}
          </div>

          {ignoredCount > 0 && (
            <div className="mt-5 border-t border-stone-200 pt-4 dark:border-lp-border">
              <div className="text-[11px] font-semibold text-stone-700 dark:text-lp-text-muted">Suggestions</div>
              <div className="mt-2 space-y-1">
                {insights.ignoredTopics.slice(0, 4).map((t) => (
                  <Link
                    key={t.id}
                    href={`/discover?topic=${t.slug}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-xs text-stone-600 hover:bg-stone-50 hover:text-stone-800 dark:text-lp-text-muted dark:hover:bg-lp-elevated dark:hover:text-lp-text transition-colors"
                  >
                    <span className="min-w-0 truncate">
                      {t.icon && <span className="mr-1.5">{t.icon}</span>}
                      {t.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-stone-400 dark:text-lp-text-subtle">Revisit</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Secondary notice area */}
      {ignoredCount > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-stone-50/60 px-5 py-4 dark:border-lp-border dark:bg-lp-surface">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-stone-400 dark:text-lp-text-subtle" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-stone-900 dark:text-lp-text">Next</div>
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
