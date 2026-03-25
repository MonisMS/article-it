import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function UpgradePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 mb-6">
        <Sparkles className="w-6 h-6 text-violet-600" />
      </div>

      <h1 className="text-3xl font-bold text-zinc-900">Pro is coming soon</h1>
      <p className="mt-4 text-zinc-500 max-w-md">
        We&apos;re working on Pro features — more topics, priority ingestion, digest history, and more.
        Stay tuned.
      </p>

      <Link
        href="/settings"
        className="mt-10 rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        ← Back to settings
      </Link>
    </div>
  )
}
