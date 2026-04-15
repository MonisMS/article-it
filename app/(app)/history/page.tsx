import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { HistoryClient } from "@/components/history-client"
import { auth } from "@/lib/auth"
import { getDigestLogsForUser, getDigestTotals } from "@/lib/db/queries/history"

export const metadata: Metadata = {
  title: "Digest History - Curio",
  description: "Every digest we've sent you, and what was in it.",
}

type Props = { searchParams: Promise<{ page?: string }> }

export default async function HistoryPage({ searchParams }: Props) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  const { page: pageParam } = await searchParams
  const page = Math.max(0, Number(pageParam ?? 0))

  const [{ logs, hasMore }, totals] = await Promise.all([
    getDigestLogsForUser(session.user.id, page),
    getDigestTotals(session.user.id),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-8 sm:px-6">
      <header className="border-b border-stone-200/80 pb-8 dark:border-[#1E2A3A]">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-[#6B7585]">
            Digest history
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6] sm:text-[2.4rem]">
            Past deliveries
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC] sm:text-base">
            A record of every digest you&apos;ve received, with the articles that were included in each send.
          </p>
        </div>
      </header>

      <HistoryClient
        logs={logs}
        hasMore={hasMore}
        page={page}
        totalDigests={totals.totalDigests}
        totalArticles={totals.totalArticles}
      />
    </div>
  )
}
