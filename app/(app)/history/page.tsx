import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDigestLogsForUser } from "@/lib/db/queries/history"
import { HistoryClient } from "@/components/history-client"

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

  const { logs, hasMore } = await getDigestLogsForUser(session.user.id, page)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="pt-10 pb-6 px-4 sm:px-6 border-b border-stone-200 mb-8 bg-gradient-to-b from-stone-50 to-transparent">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Digest History</h1>
        <p className="text-stone-400 text-sm mt-1">Every digest we've sent you, and what was in it.</p>
      </div>

      <HistoryClient logs={logs} hasMore={hasMore} page={page} />
    </div>
  )
}
