import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDigestLogsForUser, getDigestTotals } from "@/lib/db/queries/history"
import { HistoryClient } from "@/components/history-client"

export const metadata: Metadata = {
  title: "Digest History — ArticleIt",
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
    <div className="max-w-3xl mx-auto">
      <div className="pt-10 pb-6 px-4 sm:px-6 border-b border-stone-200 dark:border-[#1E2A3A] mb-8 bg-gradient-to-b from-stone-50 dark:from-[#161C26]/50 to-transparent">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-[#F0EDE6] tracking-tight">Digest History</h1>
        <p className="text-stone-400 dark:text-[#6B7585] text-sm mt-1">Every digest we've sent you, and what was in it.</p>
      </div>

      <HistoryClient logs={logs} hasMore={hasMore} page={page} totalDigests={totals.totalDigests} totalArticles={totals.totalArticles} />
    </div>
  )
}
