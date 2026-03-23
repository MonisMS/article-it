"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw } from "lucide-react"

export function TriggerIngestButton() {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  async function handleClick() {
    setStatus("loading")
    try {
      // keepalive: true ensures the request survives page navigation
      const res = await fetch("/api/ingest", {
        method: "POST",
        keepalive: true,
      })
      if (!res.ok) throw new Error("failed")
      setStatus("done")
      router.refresh()
    } catch {
      setStatus("error")
    }
  }

  if (status === "done") {
    return (
      <button
        onClick={() => router.refresh()}
        className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh feed
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      className="mt-4 flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
      {status === "error" && "Retry"}
      {status === "loading" && "Fetching articles…"}
      {status === "idle" && "Fetch articles now"}
    </button>
  )
}
