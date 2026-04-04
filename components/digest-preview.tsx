"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, X } from "lucide-react"

export function DigestPreview() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="mx-4 sm:mx-6 mb-6 flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-[#2A3547]/40 px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-[#2A3547]">
        <Mail className="h-3.5 w-3.5 text-amber-600 dark:text-[#E8A838]" />
      </div>
      <p className="flex-1 text-xs text-stone-600 dark:text-[#B8C0CC]">
        <span className="font-semibold text-stone-800 dark:text-[#F0EDE6]">Set up your digest</span>
        {" "}— get articles like these delivered to your inbox on your schedule.{" "}
        <Link
          href="/profile?tab=digests"
          className="font-medium text-amber-600 dark:text-[#E8A838] hover:underline underline-offset-2"
        >
          Configure now →
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-stone-300 dark:text-[#3A4557] hover:text-stone-500 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
