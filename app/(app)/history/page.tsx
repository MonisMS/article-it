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
    <div className="max-w-3xl mx-auto">
      <div className="pt-10 pb-6 px-4 sm:px-6 border-b border-app-border mb-6">
        <h1 className="text-3xl font-bold text-app-text tracking-tight">History</h1>
        <p className="text-app-text-muted text-sm mt-1">Every digest we've sent you, and what was in it.</p>
      </div>

      {logs.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-xl bg-app-accent-light flex items-center justify-center mx-auto mb-6">
            <History className="w-7 h-7 text-app-accent" />
          </div>
          <h2 className="text-xl font-semibold text-app-text">No digests sent yet</h2>
          <p className="text-app-text-muted text-sm mt-2 max-w-sm mx-auto">
            Once your first digest is sent, it'll show up here.
          </p>
        </div>
      ) : (
        <>
          <div className="px-4 sm:px-6 space-y-3">
            {logs.map((log) => (
              <HistoryLogRow key={log.id} log={log} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-app-border px-4 sm:px-6">
            <a
              href={`/history?page=${Math.max(0, page - 1)}`}
              className={`rounded-full border border-app-border px-5 py-2 text-sm font-medium text-app-text-muted hover:bg-app-hover transition-colors ${page === 0 ? "pointer-events-none opacity-30" : ""}`}
            >
              ← Previous
            </a>
            <span className="text-sm text-app-text-subtle">Page {page + 1}</span>
            <a
              href={`/history?page=${page + 1}`}
              className={`rounded-full border border-app-border px-5 py-2 text-sm font-medium text-app-text-muted hover:bg-app-hover transition-colors ${!hasMore ? "pointer-events-none opacity-30" : ""}`}
            >
              Next →
            </a>
          </div>
        </>
      )}
    </div>
  )
}
