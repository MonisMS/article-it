"use client"

import { useState } from "react"
import { ChevronDown, Loader2, Pause, Play, Plus, Trash2 } from "lucide-react"
import { TopicIcon } from "@/components/topic-icon"
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
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return "UTC"
  }
}

function formatSummary(frequency: string, dayOfWeek: number, hour: number): string {
  const timeLabel = HOURS[hour]?.label ?? `${hour}:00`
  if (frequency === "daily") return `Daily / ${timeLabel}`
  return `Weekly ${DAYS[dayOfWeek]} / ${timeLabel}`
}

type Topic = { id: string; name: string; slug: string; icon: string | null }
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
  frequency: "daily" | "weekly"
  dayOfWeek: number
  hour: number
  timezone: string
  isActive: boolean
  hasSchedule: boolean
  isExpanded: boolean
  isDirty: boolean
  saving: boolean
  saved: boolean
  toggling: boolean
  deleting: boolean
  error: string | null
}

function buildState(topics: Topic[], schedules: ScheduleRow[], followedIds: string[]): TopicState[] {
  const followedSet = new Set(followedIds)
  const scheduleMap = new Map(schedules.map((schedule) => [schedule.topicId, schedule]))
  return topics.filter((topic) => followedSet.has(topic.id)).map((topic) => {
    const schedule = scheduleMap.get(topic.id)
    return {
      topicId: topic.id,
      frequency: (schedule?.frequency as "daily" | "weekly") ?? "weekly",
      dayOfWeek: schedule?.dayOfWeek ?? 1,
      hour: schedule?.hour ?? 9,
      timezone: schedule?.timezone ?? detectTimezone(),
      isActive: schedule?.isActive ?? true,
      hasSchedule: !!schedule,
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
  followedIds,
  schedules: initialSchedules,
}: {
  topics: Topic[]
  followedIds: string[]
  schedules: ScheduleRow[]
}) {
  const [rows, setRows] = useState<TopicState[]>(() => buildState(topics, initialSchedules, followedIds))

  function patch(topicId: string, update: Partial<TopicState>) {
    setRows((prev) => prev.map((row) => (row.topicId === topicId ? { ...row, ...update } : row)))
  }

  function edit(topicId: string, update: Partial<Pick<TopicState, "frequency" | "dayOfWeek" | "hour" | "timezone">>) {
    setRows((prev) =>
      prev.map((row) => (row.topicId === topicId ? { ...row, ...update, isDirty: true, saved: false, error: null } : row))
    )
  }

  async function save(topicId: string) {
    const row = rows.find((item) => item.topicId === topicId)
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
    const row = rows.find((item) => item.topicId === topicId)
    if (!row) return
    const newActive = !row.isActive
    patch(topicId, { toggling: true })
    const res = await fetch("/api/user/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicIds: [topicId], isActive: newActive }),
    })
    patch(topicId, {
      toggling: false,
      isActive: res.ok ? newActive : row.isActive,
      error: res.ok ? null : "Failed to update.",
    })
  }

  return (
    <div className="divide-y divide-stone-100 dark:divide-[#1E2A3A]">
      {rows.map((row) => {
        const topic = topics.find((item) => item.id === row.topicId)
        if (!topic) return null

        return (
          <div key={row.topicId} className="py-4">
            <div className="flex items-start gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-accent-light text-app-accent">
                  <TopicIcon slug={topic.slug} size={15} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-stone-800 dark:text-[#F0EDE6]">{topic.name}</span>
                  </div>
                  <p className={`mt-1 text-xs ${row.hasSchedule ? "text-stone-500 dark:text-[#B8C0CC]" : "text-stone-400 dark:text-[#6B7585]"}`}>
                    {row.hasSchedule ? formatSummary(row.frequency, row.dayOfWeek, row.hour) : "No digest schedule yet"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {row.hasSchedule ? (
                  <>
                    {!row.isActive && (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:bg-[#1E2533] dark:text-[#8A95A7]">
                        Paused
                      </span>
                    )}
                    <button
                      onClick={() => togglePause(row.topicId)}
                      disabled={row.toggling}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 disabled:opacity-40 dark:text-[#6B7585] dark:hover:bg-[#1E2533] dark:hover:text-[#B8C0CC]"
                      title={row.isActive ? "Pause digest" : "Resume digest"}
                    >
                      {row.toggling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : row.isActive ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => remove(row.topicId)}
                      disabled={row.deleting}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40 dark:text-[#6B7585] dark:hover:bg-red-950/20"
                      title="Remove schedule"
                    >
                      {row.deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => patch(row.topicId, { isExpanded: !row.isExpanded, saved: false })}
                      className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 px-3 py-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-800 dark:border-[#1E2A3A] dark:text-[#8A95A7] dark:hover:border-[#2D3B4F] dark:hover:text-[#F0EDE6]"
                    >
                      Edit
                      <ChevronDown className={`h-3 w-3 transition-transform ${row.isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => patch(row.topicId, { isExpanded: true })}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-stone-300 px-3 py-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-800 dark:border-[#2D3B4F] dark:text-[#8A95A7] dark:hover:border-[#E8A838] dark:hover:text-[#F0EDE6]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Set schedule
                  </button>
                )}
              </div>
            </div>

            {row.isExpanded && (
              <div className="ml-8 mt-4 rounded-[1.25rem] border border-stone-200/80 bg-stone-50/80 p-4 dark:border-[#1E2A3A] dark:bg-[#0D1117]">
                <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">Frequency</p>
                    <div className="flex gap-1.5">
                      {(["daily", "weekly"] as const).map((frequency) => (
                        <button
                          key={frequency}
                          onClick={() => edit(row.topicId, { frequency })}
                          className={`rounded-full border px-3 py-1.5 text-[13px] font-medium capitalize transition-colors ${
                            row.frequency === frequency
                              ? "border-stone-300 bg-stone-900 text-white dark:border-[#E8A838] dark:bg-[#F0EDE6] dark:text-[#0D1117]"
                              : "border-stone-200/80 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-800 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#8A95A7] dark:hover:border-[#2D3B4F] dark:hover:text-[#F0EDE6]"
                          }`}
                        >
                          {frequency}
                        </button>
                      ))}
                    </div>
                  </div>

                  {row.frequency === "weekly" && (
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">Day</p>
                      <div className="flex flex-wrap gap-1">
                        {DAYS.map((day, index) => (
                          <button
                            key={day}
                            onClick={() => edit(row.topicId, { dayOfWeek: index })}
                            className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              row.dayOfWeek === index
                                ? "border-stone-300 bg-stone-900 text-white dark:border-[#E8A838] dark:bg-[#F0EDE6] dark:text-[#0D1117]"
                                : "border-stone-200/80 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-800 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#8A95A7] dark:hover:border-[#2D3B4F] dark:hover:text-[#F0EDE6]"
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-4">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">Time</p>
                    <select
                      value={row.hour}
                      onChange={(e) => edit(row.topicId, { hour: Number(e.target.value) })}
                      className="rounded-lg border border-stone-200/80 bg-white px-3 py-2 text-sm text-stone-700 outline-none transition-colors focus:border-amber-400 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#C8C4BC]"
                    >
                      {HOURS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">Timezone</p>
                    <select
                      value={row.timezone}
                      onChange={(e) => edit(row.topicId, { timezone: e.target.value })}
                      className="rounded-lg border border-stone-200/80 bg-white px-3 py-2 text-sm text-stone-700 outline-none transition-colors focus:border-amber-400 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#C8C4BC]"
                    >
                      {!TIMEZONES.includes(row.timezone) && <option value={row.timezone}>{row.timezone}</option>}
                      {TIMEZONES.map((timezone) => (
                        <option key={timezone} value={timezone}>{timezone}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => save(row.topicId)}
                    disabled={row.saving}
                    className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#F0EDE6] dark:text-[#0D1117]"
                  >
                    {row.saving && <Loader2 className="h-3 w-3 animate-spin" />}
                    {row.saving ? "Saving..." : "Save"}
                  </button>
                  <DigestPreviewModal topicId={row.topicId} topicName={topic.name} topicIcon={topic.icon} />
                  {row.saved && <span className="text-xs font-medium text-green-600 dark:text-green-400">Saved</span>}
                  {row.error && <span className="text-xs text-red-500">{row.error}</span>}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
