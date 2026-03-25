import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDigestLogsForUser } from "@/lib/db/queries/history"
import { HistoryLogRow } from "@/components/history-log-row"
import { History } from "lucide-react"

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Digest History</h1>
        <p className="text-sm text-zinc-500 mt-1">Every digest we've sent you, and what was in it.</p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 mb-4">
            <History className="w-5 h-5 text-zinc-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">No digests yet</h2>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs">
            Once your first digest is sent, it'll show up here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => (
              <HistoryLogRow key={log.id} log={log} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100">
            <a
              href={`/history?page=${Math.max(0, page - 1)}`}
              className={`rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors ${page === 0 ? "pointer-events-none opacity-30" : ""}`}
            >
              ← Previous
            </a>
            <span className="text-sm text-zinc-400">Page {page + 1}</span>
            <a
              href={`/history?page=${page + 1}`}
              className={`rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors ${!hasMore ? "pointer-events-none opacity-30" : ""}`}
            >
              Next →
            </a>
          </div>
        </>
      )}
    </div>
  )
}
