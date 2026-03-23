"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Loader2 } from "lucide-react"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const label = i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`
  return { value: i, label }
})

function detectTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return "UTC" }
}

export default function SchedulePage() {
  const router = useRouter()
  const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly")
  const [dayOfWeek, setDayOfWeek] = useState(0) // Sunday
  const [hour, setHour] = useState(9) // 9 AM
  const [timezone, setTimezone] = useState("UTC")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setTimezone(detectTimezone())
  }, [])

  async function handleFinish() {
    setSaving(true)
    setError("")

    const res = await fetch("/api/user/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frequency,
        dayOfWeek: frequency === "weekly" ? dayOfWeek : null,
        hour,
        timezone,
      }),
    })
    const { error } = await res.json()

    if (error) {
      setError(error)
      setSaving(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-zinc-900">
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 text-white">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          ArticleIt
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="font-medium text-zinc-900">Step 2</span>
          <span>/</span>
          <span>2</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-zinc-900">When should we deliver?</h1>
            <p className="mt-2 text-zinc-500 text-sm">
              Set your digest schedule. You can change this anytime in settings.
            </p>
          </div>

          <div className="space-y-6">
            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-3">
                How often?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["daily", "weekly"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-all
                      ${frequency === f
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-300"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Day of week (weekly only) */}
            {frequency === "weekly" && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">
                  Which day?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => setDayOfWeek(i)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all
                        ${dayOfWeek === i
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time */}
            <div>
              <label htmlFor="hour" className="block text-sm font-medium text-zinc-700 mb-3">
                What time?
              </label>
              <select
                id="hour"
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-colors"
              >
                {HOURS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Timezone display (auto-detected, not editable for now) */}
            <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Timezone (auto-detected)</span>
              <span className="text-xs font-medium text-zinc-700">{timezone}</span>
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-600">
              You&apos;ll receive your digest{" "}
              <span className="font-semibold text-zinc-900">
                {frequency === "daily"
                  ? `every day at ${HOURS[hour].label}`
                  : `every ${DAYS[dayOfWeek]} at ${HOURS[hour].label}`}
              </span>
              .
            </div>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Setting up your feed…" : "Go to my feed →"}
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full text-center text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
