"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-[#0D1117] px-4">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-[#F0EDE6]">Something went wrong</h1>
          <p className="text-sm text-stone-400 dark:text-[#6B7585] mt-2 leading-relaxed">
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
