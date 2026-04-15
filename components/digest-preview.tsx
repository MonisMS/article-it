"use client"

import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"

export function DigestPreview() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="flex items-start gap-2">
      <p className="text-sm text-stone-500 dark:text-[#8A95A7] flex-1">
        No email digest configured.{" "}
        <Link
          href="/profile?tab=digests"
          className="text-stone-600 dark:text-[#B8C0CC] underline underline-offset-2 hover:text-stone-800 dark:hover:text-[#F0EDE6] transition-colors"
        >
          Set one up →
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-stone-300 dark:text-[#3A4557] hover:text-stone-400 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}