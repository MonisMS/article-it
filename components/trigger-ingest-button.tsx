"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw, LogIn } from "lucide-react"

export function TriggerIngestButton() {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "unauth" | "forbidden">("idle")

  async function handleClick() {
    setStatus("loading")
    try {
      const res = await fetch("/api/ingest", { method: "POST" })
      if (res.status === 401) { setStatus("unauth"); return }
      if (res.status === 403 || res.status === 404) { setStatus("forbidden"); return }
      if (!res.ok) { setStatus("error"); return }
      setStatus("done")
      router.refresh()
    } catch {
      setStatus("error")
    }
  }

  if (status === "unauth") {
    return (
      <a
        href="/sign-in"
        className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        <LogIn className="w-4 h-4" /> Session expired — sign in again
      </a>
    )
  }

  if (status === "done") {
    return (
      <button
        onClick={() => router.refresh()}
        className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        <RefreshCw className="w-4 h-4" /> Refresh feed
      </button>
    )
  }

  if (status === "forbidden") {
    return (
      <button
        disabled
        className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 opacity-60 cursor-not-allowed"
      >
        Fetch articles now
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
      {status === "loading" ? "Fetching articles…" : status === "error" ? "Failed — retry" : "Fetch articles now"}
    </button>
  )
}
