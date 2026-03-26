import Link from "next/link"
import { BookOpen, Bookmark, TrendingUp, AlertCircle } from "lucide-react"
import type { ReadingInsightsData } from "@/lib/db/queries/insights"

export function ReadingInsights({
  insights,
  bookmarkCount,
}: {
  insights: ReadingInsightsData
  bookmarkCount: number
}) {
  const hasAnyReads = insights.totalReads > 0

  if (!hasAnyReads) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-app-text-subtle">Start reading articles to see your insights here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-app-bg border border-app-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-app-accent" />
            <span className="text-xs text-app-text-subtle font-medium">This week</span>
          </div>
          <p className="text-2xl font-bold text-app-text">{insights.readLast7Days}</p>
          <p className="text-xs text-app-text-subtle mt-0.5">articles read</p>
        </div>

        <div className="rounded-lg bg-app-bg border border-app-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-app-accent" />
            <span className="text-xs text-app-text-subtle font-medium">This month</span>
          </div>
          <p className="text-2xl font-bold text-app-text">{insights.readLast30Days}</p>
          <p className="text-xs text-app-text-subtle mt-0.5">articles read</p>
        </div>

        <div className="rounded-lg bg-app-bg border border-app-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="w-3.5 h-3.5 text-app-accent" />
            <span className="text-xs text-app-text-subtle font-medium">Saved</span>
          </div>
          <p className="text-2xl font-bold text-app-text">{bookmarkCount}</p>
          <p className="text-xs text-app-text-subtle mt-0.5">bookmarks</p>
        </div>
      </div>

      {/* ── Top topic + source ────────────────────────────────── */}
      {(insights.topTopicName || insights.mostReadSourceName) && (
        <div className="flex flex-col gap-2">
          {insights.topTopicName && (
            <div className="flex items-center justify-between rounded-lg bg-app-bg border border-app-border px-4 py-3">
              <span className="text-sm text-app-text-muted">Most-read topic this month</span>
              <span className="text-sm font-semibold text-app-text flex items-center gap-1.5">
                {insights.topTopicIcon && <span>{insights.topTopicIcon}</span>}
                {insights.topTopicName}
              </span>
            </div>
          )}
          {insights.mostReadSourceName && (
            <div className="flex items-center justify-between rounded-lg bg-app-bg border border-app-border px-4 py-3">
              <span className="text-sm text-app-text-muted">Most-read source this month</span>
              <span className="text-sm font-semibold text-app-text">{insights.mostReadSourceName}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Ignored topics ────────────────────────────────────── */}
      {insights.ignoredTopics.length > 0 && (
        <div className="rounded-lg border border-app-border bg-app-bg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-3.5 h-3.5 text-app-text-subtle" />
            <p className="text-sm font-medium text-app-text">
              {insights.ignoredTopics.length === 1
                ? "You haven't read anything from this topic in 30 days"
                : `You haven't read anything from these ${insights.ignoredTopics.length} topics in 30 days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.ignoredTopics.map((t) => (
              <Link
                key={t.id}
                href={`/discover?topic=${t.slug}`}
                className="flex items-center gap-1.5 rounded-full border border-app-border bg-app-surface px-3 py-1 text-xs font-medium text-app-text-muted hover:border-app-border-strong hover:text-app-text transition-colors"
              >
                {t.icon && <span>{t.icon}</span>}
                {t.name}
              </Link>
            ))}
          </div>
          <p className="text-xs text-app-text-subtle mt-3">
            Not interested anymore?{" "}
            <Link href="/profile#topics" className="text-app-accent hover:underline underline-offset-2">
              Update your topics
            </Link>
          </p>
        </div>
      )}

    </div>
  )
}
