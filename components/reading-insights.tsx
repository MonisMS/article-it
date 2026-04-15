"use client"

import Link from "next/link"
import type { ReactNode } from "react"
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
      <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-9 text-center dark:border-lp-border dark:bg-lp-surface">
        <p className="text-sm text-stone-500 dark:text-lp-text-muted">Start reading articles to see your insights here.</p>
      </div>
    )
  }

  const topicsThisMonth = insights.topicReadCounts.slice(0, 7)
  const ignoredCount = insights.ignoredTopics.length

  const digestLabel = () => {
    if (digestTotal === undefined || digestActive === undefined) return null
    if (digestTotal === 0) return "Not set"
    if (digestActive === digestTotal) return `${digestActive} active`
    return `${digestActive} active / ${digestTotal} total`
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
          <div className="border-b border-stone-200/80 pb-4 dark:border-lp-border">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-lp-text-subtle">
              Overview
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-lp-text">Reading snapshot</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500 dark:text-lp-text-muted">
              A compact view of your recent reading habits and the topics you return to most often.
            </p>

            <div className="mt-5 flex flex-wrap gap-6">
              <div>
                <div className="text-xl font-semibold text-stone-900 dark:text-lp-text">{insights.readLast7Days}</div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400 dark:text-lp-text-subtle">
                  This week
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold text-stone-900 dark:text-lp-text">{insights.readLast30Days}</div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400 dark:text-lp-text-subtle">
                  Last 30 days
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-lp-text-subtle">
                  Topics
                </p>
                <h3 className="mt-2 text-lg font-semibold text-stone-900 dark:text-lp-text">Most read lately</h3>
              </div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-lp-text-subtle">
                Last 30 days
              </div>
            </div>

            {topicsThisMonth.length > 0 ? (
              <div className="mt-4 divide-y divide-stone-100 dark:divide-lp-border">
                {topicsThisMonth.map((topic) => (
                  <div key={topic.topicId} className="flex items-center gap-3 py-3.5">
                    <span className="w-7 shrink-0 text-lg leading-none">{topic.icon ?? "*"}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-stone-800 dark:text-lp-text">{topic.name}</div>
                    </div>
                    <div className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-lp-text-subtle">
                      {topic.count} reads
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

        <aside className="rounded-[1.75rem] border border-stone-200 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-lp-text-subtle">
            Summary
          </p>
          <div className="mt-4 space-y-3">
            {insights.topTopicName && (
              <SummaryRow
                label="Top topic"
                value={
                  <span className="flex items-center gap-1.5">
                    {insights.topTopicIcon && <span>{insights.topTopicIcon}</span>}
                    <span className="truncate">{insights.topTopicName}</span>
                  </span>
                }
              />
            )}

            {insights.mostReadSourceName && (
              <SummaryRow label="Top source" value={insights.mostReadSourceName} />
            )}

            <SummaryRow label="Weekly pace" value={`${insights.readLast7Days} reads`} />

            {digestLabel() && (
              <SummaryRow label="Digests" value={digestLabel()!} />
            )}

            {ignoredCount > 0 && (
              <SummaryRow label="Quiet topics" value={`${ignoredCount}`} />
            )}
          </div>

          {ignoredCount > 0 && (
            <div className="mt-5 border-t border-stone-200 pt-4 dark:border-lp-border">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-lp-text-subtle">
                Revisit
              </div>
              <div className="mt-3 space-y-2">
                {insights.ignoredTopics.slice(0, 4).map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/discover?topic=${topic.slug}`}
                    className="block rounded-lg px-2 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900 dark:text-lp-text-muted dark:hover:bg-lp-elevated dark:hover:text-lp-text"
                  >
                    {topic.icon && <span className="mr-2">{topic.icon}</span>}
                    {topic.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {ignoredCount > 0 && (
        <section className="rounded-[1.75rem] border border-stone-200 bg-stone-50/60 px-5 py-4 dark:border-lp-border dark:bg-lp-surface">
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
            {insights.ignoredTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/discover?topic=${topic.slug}`}
                className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-lp-border dark:bg-lp-surface dark:text-lp-text-muted dark:hover:bg-lp-elevated dark:hover:text-lp-text"
              >
                {topic.icon && <span>{topic.icon}</span>}
                {topic.name}
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

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-lp-text-subtle">{label}</div>
      <div className="max-w-[10rem] text-right text-sm font-medium text-stone-800 dark:text-lp-text">{value}</div>
    </div>
  )
}
