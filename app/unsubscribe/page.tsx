import Link from "next/link"
import { BookOpen, CheckCircle, XCircle } from "lucide-react"
import { db } from "@/lib/db"
import { digestSchedules } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token"

type Props = {
  searchParams: Promise<{ id?: string; sig?: string }>
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { id, sig } = await searchParams

  let success = false
  let topicName = ""

  if (id && sig && verifyUnsubscribeToken(id, sig)) {
    const schedule = await db.query.digestSchedules.findFirst({
      where: eq(digestSchedules.id, id),
      with: { topic: { columns: { name: true } } },
    })

    if (schedule && schedule.isActive) {
      await db
        .update(digestSchedules)
        .set({ isActive: false })
        .where(eq(digestSchedules.id, id))
      topicName = schedule.topic.name
      success = true
    } else if (schedule && !schedule.isActive) {
      // Already unsubscribed — still show success
      topicName = schedule.topic.name
      success = true
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-zinc-900 mb-10">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          ArticleIt
        </Link>

        {success ? (
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-100 mx-auto mb-6">
              <CheckCircle className="w-6 h-6 text-zinc-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Unsubscribed</h1>
            <p className="text-sm text-zinc-500 leading-relaxed mb-8">
              You won&apos;t receive any more <span className="font-medium text-zinc-700">{topicName}</span> digest emails.
              You can re-enable this at any time from your settings.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mx-auto mb-6">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Invalid link</h1>
            <p className="text-sm text-zinc-500 leading-relaxed mb-8">
              This unsubscribe link is invalid or has already been used. To manage your digests, visit your settings.
            </p>
          </>
        )}

        <Link
          href="/settings"
          className="text-sm font-medium text-zinc-700 border border-zinc-200 rounded-lg px-4 py-2.5 hover:bg-zinc-100 transition-colors"
        >
          Manage digest settings
        </Link>
      </div>
    </div>
  )
}
