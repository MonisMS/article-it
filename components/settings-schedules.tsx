"use client"

import { useState } from "react"
import { ChevronDown, Trash2, Loader2, Pause, Play, Plus } from "lucide-react"
import { DigestPreviewModal } from "@/components/digest-preview-modal"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const label =
    i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`
  return { value: i, label }
})

const TIMEZONES = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Helsinki",
  "Europe/Istanbul",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
]

function detectTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return "UTC" }
}

function formatSummary(frequency: string, dayOfWeek: number, hour: number): string {
  const timeLabel = HOURS[hour]?.label ?? `${hour}:00`
  if (frequency === "daily") return `Daily · ${timeLabel}`
  return `Weekly ${DAYS[dayOfWeek]} · ${timeLabel}`
}

type Topic = { id: string; name: string; icon: string | null }
type ScheduleRow = {
  topicId: string
  frequency: string
  dayOfWeek: number | null
  hour: number
  timezone: string
  isActive: boolean
}

type TopicState = {
  topicId: string
  // schedule values
  frequency: "daily" | "weekly"
  dayOfWeek: number
  hour: number
  timezone: string
  isActive: boolean
  hasSchedule: boolean
  // ui state
  isExpanded: boolean
  isDirty: boolean
  saving: boolean
  saved: boolean
  toggling: boolean
  deleting: boolean
  error: string | null
}

function buildState(topics: Topic[], schedules: ScheduleRow[]): TopicState[] {
  const scheduleMap = new Map(schedules.map((s) => [s.topicId, s]))
  return topics.map((t) => {
    const s = scheduleMap.get(t.id)
    return {
      topicId: t.id,
      frequency: (s?.frequency as "daily" | "weekly") ?? "weekly",
      dayOfWeek: s?.dayOfWeek ?? 1,
      hour: s?.hour ?? 9,
      timezone: s?.timezone ?? detectTimezone(),
      isActive: s?.isActive ?? true,
      hasSchedule: !!s,
      isExpanded: false,
      isDirty: false,
      saving: false,
      saved: false,
      toggling: false,
      deleting: false,
      error: null,
    }
  })
}

export function SettingsSchedules({
  topics,
  schedules: initialSchedules,
}: {
  topics: Topic[]
  schedules: ScheduleRow[]
}) {
  const [rows, setRows] = useState<TopicState[]>(() => buildState(topics, initialSchedules))

  function patch(topicId: string, update: Partial<TopicState>) {
    setRows((prev) => prev.map((r) => r.topicId === topicId ? { ...r, ...update } : r))
  }

  function edit(topicId: string, update: Partial<Pick<TopicState, "frequency" | "dayOfWeek" | "hour" | "timezone">>) {
    setRows((prev) =>
      prev.map((r) => r.topicId === topicId ? { ...r, ...update, isDirty: true, saved: false, error: null } : r)
    )
  }

  async function save(topicId: string) {
    const row = rows.find((r) => r.topicId === topicId)
    if (!row) return
    patch(topicId, { saving: true, error: null })
    const res = await fetch("/api/user/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicId,
        frequency: row.frequency,
        dayOfWeek: row.frequency === "weekly" ? row.dayOfWeek : null,
        hour: row.hour,
        timezone: row.timezone,
      }),
    })
    if (res.ok) {
      patch(topicId, { saving: false, saved: true, isDirty: false, hasSchedule: true, isActive: true })
    } else {
      patch(topicId, { saving: false, error: "Failed to save. Try again." })
    }
  }

  async function remove(topicId: string) {
    patch(topicId, { deleting: true, error: null })
    const res = await fetch("/api/user/schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId }),
    })
    if (res.ok) {
      patch(topicId, { deleting: false, hasSchedule: false, isExpanded: false, saved: false, isDirty: false })
    } else {
      patch(topicId, { deleting: false, error: "Failed to delete. Try again." })
    }
  }

  async function togglePause(topicId: string) {
    const row = rows.find((r) => r.topicId === topicId)
    if (!row) return
    const newActive = !row.isActive
    patch(topicId, { toggling: true })
    const res = await fetch("/api/user/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicIds: [topicId], isActive: newActive }),
    })
    patch(topicId, { toggling: false, isActive: res.ok ? newActive : row.isActive, error: res.ok ? null : "Failed to update." })
  }

  return (
    <div className="divide-y divide-stone-100 dark:divide-[#1E2A3A]">
      {rows.map((row) => {
        const topic = topics.find((t) => t.id === row.topicId)
        if (!topic) return null

        return (
          <div key={row.topicId}>
            {/* ── Row header ──────────────────────────────── */}
            <div className="flex items-center gap-3 py-3.5">
              {/* Topic label */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg leading-none flex-shrink-0">{topic.icon ?? "📄"}</span>
                <span className="text-sm font-medium text-stone-800 dark:text-[#F0EDE6] truncate">{topic.name}</span>
              </div>

              {/* Schedule summary / status */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {row.hasSchedule ? (
                  <>
                    <span className={`text-xs tabular-nums ${row.isActive ? "text-stone-500 dark:text-[#B8C0CC]" : "text-stone-300 dark:text-[#3A4557] line-through"}`}>
                      {formatSummary(row.frequency, row.dayOfWeek, row.hour)}
                    </span>
                    {!row.isActive && (
                      <span className="text-xs font-medium text-stone-400 dark:text-[#6B7585] bg-stone-100 dark:bg-[#1E2533] px-1.5 py-0.5 rounded-full">
                        Paused
                      </span>
                    )}
                    {/* Pause / delete */}
                    <button
                      onClick={() => togglePause(row.topicId)}
                      disabled={row.toggling}
                      className="p-1.5 rounded-md text-stone-300 dark:text-[#3A4557] hover:text-stone-500 dark:hover:text-[#6B7585] hover:bg-stone-100 dark:hover:bg-[#1E2533] transition-colors disabled:opacity-40"
                      title={row.isActive ? "Pause digest" : "Resume digest"}
                    >
                      {row.toggling
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : row.isActive
                        ? <Pause className="w-3.5 h-3.5" />
                        : <Play className="w-3.5 h-3.5" />
                      }
                    </button>
                    <button
                      onClick={() => remove(row.topicId)}
                      disabled={row.deleting}
                      className="p-1.5 rounded-md text-stone-300 dark:text-[#3A4557] hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-40"
                      title="Remove schedule"
                    >
                      {row.deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                    {/* Expand toggle */}
                    <button
                      onClick={() => patch(row.topicId, { isExpanded: !row.isExpanded, saved: false })}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-[#1E2A3A] text-xs font-medium text-stone-500 dark:text-[#6B7585] hover:border-stone-300 dark:hover:border-[#2D3B4F] hover:text-stone-700 dark:hover:text-[#B8C0CC] transition-colors"
                    >
                      Edit
                      <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${row.isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => patch(row.topicId, { isExpanded: true })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-stone-300 dark:border-[#2D3B4F] text-xs font-medium text-stone-400 dark:text-[#6B7585] hover:border-amber-400 dark:hover:border-amber-600 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Set schedule
                  </button>
                )}
              </div>
            </div>

            {/* ── Expanded edit panel ──────────────────── */}
            {row.isExpanded && (
              <div className="pb-5 pl-7">
                <div className="rounded-xl border border-stone-100 dark:border-[#1E2A3A] bg-stone-50 dark:bg-[#0D1117] p-4 space-y-4">

                  {/* Frequency */}
                  <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
                    <div>
                      <p className="text-xs font-medium text-stone-400 dark:text-[#6B7585] mb-2">Frequency</p>
                      <div className="flex gap-1.5">
                        {(["daily", "weekly"] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => edit(row.topicId, { frequency: f })}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all active:scale-95 ${
                              row.frequency === f
                                ? "border-stone-800 dark:border-[#F0EDE6] bg-stone-800 dark:bg-[#F0EDE6] text-white dark:text-[#0D1117]"
                                : "border-stone-200 dark:border-[#1E2A3A] text-stone-500 dark:text-[#6B7585] hover:border-stone-400 dark:hover:border-[#2D3B4F]"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Day — weekly only */}
                    {row.frequency === "weekly" && (
                      <div>
                        <p className="text-xs font-medium text-stone-400 dark:text-[#6B7585] mb-2">Day</p>
                        <div className="flex gap-1">
                          {DAYS.map((day, i) => (
                            <button
                              key={day}
                              onClick={() => edit(row.topicId, { dayOfWeek: i })}
                              className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                                row.dayOfWeek === i
                                  ? "border-stone-800 dark:border-[#F0EDE6] bg-stone-800 dark:bg-[#F0EDE6] text-white dark:text-[#0D1117]"
                                  : "border-stone-200 dark:border-[#1E2A3A] text-stone-500 dark:text-[#6B7585] hover:border-stone-400 dark:hover:border-[#2D3B4F]"
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Time + Timezone */}
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs font-medium text-stone-400 dark:text-[#6B7585] mb-2">Time</p>
                      <select
                        value={row.hour}
                        onChange={(e) => edit(row.topicId, { hour: Number(e.target.value) })}
                        className="rounded-lg border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-3 py-1.5 text-xs text-stone-700 dark:text-[#C8C4BC] outline-none focus:border-stone-400 dark:focus:border-[#2D3B4F] transition-colors"
                      >
                        {HOURS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-stone-400 dark:text-[#6B7585] mb-2">Timezone</p>
                      <select
                        value={row.timezone}
                        onChange={(e) => edit(row.topicId, { timezone: e.target.value })}
                        className="rounded-lg border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-3 py-1.5 text-xs text-stone-700 dark:text-[#C8C4BC] outline-none focus:border-stone-400 dark:focus:border-[#2D3B4F] transition-colors"
                      >
                        {!TIMEZONES.includes(row.timezone) && (
                          <option value={row.timezone}>{row.timezone}</option>
                        )}
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => save(row.topicId)}
                      disabled={row.saving}
                      className="flex items-center gap-1.5 rounded-lg bg-stone-800 dark:bg-[#F0EDE6] px-4 py-2 text-xs font-semibold text-white dark:text-[#0D1117] hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                      {row.saving && <Loader2 className="w-3 h-3 animate-spin" />}
                      {row.saving ? "Saving…" : "Save"}
                    </button>
                    <DigestPreviewModal topicId={row.topicId} topicName={topic.name} topicIcon={topic.icon} />
                    {row.saved && <span className="text-xs font-medium text-green-600 dark:text-green-400">Saved ✓</span>}
                    {row.error && <span className="text-xs text-red-500">{row.error}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
