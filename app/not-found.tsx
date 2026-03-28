import Link from "next/link"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-[#0D1117] px-4">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-[#2A3547] dark:to-[#2A3547] flex items-center justify-center mb-5">
          <FileQuestion className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-[#F0EDE6]">Page not found</h1>
        <p className="text-sm text-stone-400 dark:text-[#6B7585] mt-2 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Go to feed
        </Link>
      </div>
    </div>
  )
}
