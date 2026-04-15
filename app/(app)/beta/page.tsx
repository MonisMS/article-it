"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const FEATURES = [
  "Feed",
  "Discover",
  "Search",
  "Bookmarks",
  "History",
  "Profile / Settings",
  "Auth / Onboarding",
  "Emails / Digest",
  "Other",
] as const

type Feature = (typeof FEATURES)[number]

const ISSUES_BY_FEATURE: Record<Feature, string[]> = {
  Feed: [
    "Ranking feels wrong",
    "Missing articles",
    "Read/bookmark isn't saving",
    "Slow or laggy",
    "UI looks broken",
    "Other",
  ],
  Discover: [
    "Topics are confusing",
    "Filtering doesn't work",
    "Slow or laggy",
    "UI looks broken",
    "Other",
  ],
  Search: [
    "Results look wrong",
    "No results when expected",
    "Slow or laggy",
    "UI looks broken",
    "Other",
  ],
  Bookmarks: [
    "Can't bookmark",
    "Bookmarks missing",
    "UI looks broken",
    "Other",
  ],
  History: [
    "Read state is wrong",
    "History missing",
    "UI looks broken",
    "Other",
  ],
  "Profile / Settings": [
    "Can't update profile",
    "Schedule/settings confusing",
    "UI looks broken",
    "Other",
  ],
  "Auth / Onboarding": [
    "Can't sign in",
    "OAuth sign-in issues",
    "Email verification issues",
    "UI looks broken",
    "Other",
  ],
  "Emails / Digest": [
    "Digest not arriving",
    "Digest content looks wrong",
    "Links/buttons not working",
    "Other",
  ],
  Other: ["Other"],
}

export default function BetaFeedbackPage() {
  const pathname = usePathname()

  const [feature, setFeature] = useState<Feature>("Feed")
  const [issue, setIssue] = useState(() => ISSUES_BY_FEATURE.Feed[0])
  const [customIssue, setCustomIssue] = useState("")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const issues = useMemo(() => ISSUES_BY_FEATURE[feature], [feature])
  const isOther = issue === "Other"

  function onFeatureChange(next: Feature) {
    setFeature(next)
    const nextIssue = ISSUES_BY_FEATURE[next][0] ?? "Other"
    setIssue(nextIssue)
    setCustomIssue("")
    setStatus(null)
  }

  const resolvedIssue = isOther ? customIssue.trim() : issue
  const canSubmit = resolvedIssue.length > 0 && !submitting

  async function onSubmit() {
    if (!canSubmit) return

    setSubmitting(true)
    setStatus(null)

    try {
      const res = await fetch("/api/user/beta-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature,
          issue: resolvedIssue,
          details,
          path: pathname,
        }),
      })

      const json = (await res.json()) as { data: unknown; error: string | null }
      if (!res.ok) {
        setStatus(json.error || "Failed to send")
        return
      }

      setDetails("")
      setCustomIssue("")
      setStatus("Sent — thank you!")
    } catch {
      setStatus("Failed to send")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-8 sm:px-6">
      <header className="border-b border-stone-200/80 pb-8 dark:border-[#1E2A3A]">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-[#6B7585]">
            Beta feedback
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6] sm:text-[2.4rem]">
            Report an issue
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC] sm:text-base">
            Pick the area you ran into trouble with and describe what happened. This sends a note to the team.
          </p>
        </div>
      </header>

      <div className="py-8">
        <div className="rounded-2xl border border-stone-200/80 bg-white/70 p-5 shadow-sm dark:border-[#1E2A3A] dark:bg-[#121925]/70 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-xs font-medium text-stone-600 dark:text-[#B8C0CC]">Feature</label>
              <select
                value={feature}
                onChange={(e) => onFeatureChange(e.target.value as Feature)}
                className="h-9 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm shadow-sm outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-[#1E2A3A] dark:bg-[#0F1622]"
              >
                {FEATURES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <label className="text-xs font-medium text-stone-600 dark:text-[#B8C0CC]">Issue</label>
              <select
                value={issue}
                onChange={(e) => {
                  setIssue(e.target.value)
                  setStatus(null)
                }}
                className="h-9 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm shadow-sm outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-[#1E2A3A] dark:bg-[#0F1622]"
              >
                {issues.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isOther && (
            <div className="mt-4 grid gap-1">
              <label className="text-xs font-medium text-stone-600 dark:text-[#B8C0CC]">Custom issue</label>
              <input
                value={customIssue}
                onChange={(e) => {
                  setCustomIssue(e.target.value)
                  setStatus(null)
                }}
                placeholder="Briefly describe the issue"
                className="h-9 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-[#1E2A3A] dark:bg-[#0F1622] dark:placeholder:text-[#6B7585]"
              />
            </div>
          )}

          <div className="mt-4 grid gap-1">
            <label className="text-xs font-medium text-stone-600 dark:text-[#B8C0CC]">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => {
                setDetails(e.target.value)
                setStatus(null)
              }}
              placeholder="Though it is optional, but pls take some time out and help me understand the issue."
              className="min-h-28 w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-[#1E2A3A] dark:bg-[#0F1622] dark:placeholder:text-[#6B7585]"
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button type="button" onClick={onSubmit} disabled={!canSubmit}>
              {submitting ? "Sending…" : "Send feedback"}
            </Button>
            {status && <p className="text-sm text-stone-500 dark:text-[#B8C0CC]">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
