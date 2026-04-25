"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

export function WaitlistButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")

  async function join() {
    if (state !== "idle") return
    setState("loading")
    try {
      const res = await fetch("/api/user/beta-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "Pro Upgrade",
          issue: "Waitlist signup",
          details: `User ${email} joined the Pro waitlist.`,
          path: "/upgrade",
        }),
      })
      setState(res.ok ? "done" : "error")
    } catch {
      setState("error")
    }
  }

  if (state === "done") {
    return (
      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
        You&apos;re on the list — we&apos;ll email you at {email} when Pro launches.
      </p>
    )
  }

  return (
    <button
      onClick={join}
      disabled={state === "loading"}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {state === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {state === "error" ? "Try again" : state === "loading" ? "Joining…" : "Notify me when Pro launches"}
    </button>
  )
}
