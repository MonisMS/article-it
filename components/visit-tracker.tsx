"use client"

import { useEffect } from "react"

/** Fires POST /api/user/visit on mount to stamp lastVisitAt for next visit's "new since" count. */
export function VisitTracker() {
  useEffect(() => {
    fetch("/api/user/visit", { method: "POST" }).catch(() => {})
  }, [])

  return null
}
