"use client"

import { useState } from "react"
import { Plus, Trash2, Loader2, ChevronDown, Pause, Play } from "lucide-react"
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

type Topic = { id: string; name: string; icon: string | null }
type ScheduleRow = {
  topicId: string
  frequency: string
  dayOfWeek: number | null
  hour: number
  timezone: string
  isActive: boolean
}
type Slot = {
  id: string
  frequency: "daily" | "weekly"
  dayOfWeek: number
  hour: number
  timezone: string
  topicIds: string[]
  isPaused: boolean
  saving: boolean
  saved: boolean
  toggling: boolean
  error: string | null
}

function inferSlots(schedules: ScheduleRow[]): Slot[] {
  const map = new Map<string, Slot>()
  let idx = 0
  for (const s of schedules) {
    const key = `${s.frequency}-${s.dayOfWeek ?? "x"}-${s.hour}`
    if (!map.has(key)) {
      map.set(key, {
        id: `slot-${idx++}`,
        frequency: (s.frequency as "daily" | "weekly") ?? "weekly",
        dayOfWeek: s.dayOfWeek ?? 0,
        hour: s.hour,
        timezone: s.timezone || detectTimezone(),
        topicIds: [],
        isPaused: !s.isActive,
        saving: false,
        saved: false,
        toggling: false,
        error: null,
      })
    }
    map.get(key)!.topicIds.push(s.topicId)
  }
  return Array.from(map.values())
}

let nextId = 100

export function SettingsSchedules({
  topics,
  schedules: initialSchedules,
}: {
  topics: Topic[]
  schedules: ScheduleRow[]
}) {
  const [slots, setSlots] = useState<Slot[]>(() => inferSlots(initialSchedules))
  const [showTopicPicker, setShowTopicPicker] = useState<string | null>(null)

  const scheduledTopicIds = new Set(slots.flatMap((s) => s.topicIds))
  const unscheduled = topics.filter((t) => !scheduledTopicIds.has(t.id))

  function addSlot() {
    setSlots((prev) => [
      ...prev,
      {
        id: `slot-${nextId++}`,
        frequency: "weekly",
        dayOfWeek: 1,
        hour: 9,
        timezone: detectTimezone(),
        topicIds: [],
        isPaused: false,
        saving: false,
        saved: false,
        toggling: false,
        error: null,
      },
    ])
  }

  async function removeSlot(slotId: string) {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return

    setSlots((prev) => prev.filter((s) => s.id !== slotId))

    const results = await Promise.all(
      slot.topicIds.map((topicId) =>
        fetch("/api/user/schedule", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId }),
        }).then((r) => r.ok)
      )
    )

    if (results.some((ok) => !ok)) {
      setSlots((prev) => [
        ...prev,
        { ...slot, error: "Failed to delete schedule. Please try again." },
      ])
    }
  }

  async function togglePause(slotId: string) {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot || slot.topicIds.length === 0) return

    const newPaused = !slot.isPaused
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, toggling: true } : s)))

    const res = await fetch("/api/user/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicIds: slot.topicIds, isActive: !newPaused }),
    })

    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, toggling: false, isPaused: res.ok ? newPaused : s.isPaused, error: res.ok ? null : "Failed to update. Please try again." }
          : s
      )
    )
  }

  function updateSlot(slotId: string, patch: Partial<Omit<Slot, "id" | "saving" | "saved" | "toggling" | "error">>) {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, ...patch, saved: false, error: null } : s))
    )
  }

  function assignTopic(slotId: string, topicId: string) {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) return { ...s, topicIds: [...s.topicIds, topicId], saved: false, error: null }
        return { ...s, topicIds: s.topicIds.filter((id) => id !== topicId) }
      })
    )
    setShowTopicPicker(null)
  }

  async function unassignTopic(slotId: string, topicId: string) {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId ? { ...s, topicIds: s.topicIds.filter((id) => id !== topicId), saved: false, error: null } : s
      )
    )

    const res = await fetch("/api/user/schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId }),
    })

    if (!res.ok) {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? { ...s, topicIds: [...s.topicIds, topicId], error: "Failed to remove topic. Please try again." }
            : s
        )
      )
    }
  }

  async function saveSlot(slotId: string) {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot || slot.topicIds.length === 0) return

    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, saving: true, error: null } : s)))

    const results = await Promise.all(
      slot.topicIds.map((topicId) =>
        fetch("/api/user/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frequency: slot.frequency,
            dayOfWeek: slot.frequency === "weekly" ? slot.dayOfWeek : null,
            hour: slot.hour,
            timezone: slot.timezone,
            topicId,
          }),
        }).then((r) => r.ok)
      )
    )

    const allOk = results.every(Boolean)
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, saving: false, saved: allOk, error: allOk ? null : "Failed to save schedule. Please try again." }
          : s
      )
    )
  }

  return (
    <div className="space-y-4">
      {slots.map((slot) => {
        const slotTopics = topics.filter((t) => slot.topicIds.includes(t.id))
        const addableTopics = topics
          .filter((t) => !scheduledTopicIds.has(t.id) || slot.topicIds.includes(t.id))
          .filter((t) => !slot.topicIds.includes(t.id))

        return (
          <div
            key={slot.id}
            className={`rounded-xl border p-5 transition-colors ${
              slot.isPaused ? "bg-app-hover border-app-border opacity-75" : "bg-app-surface border-app-border"
            }`}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-app-text">Schedule</p>
                {slot.isPaused && (
                  <span className="rounded-full bg-app-active text-app-text-muted text-xs font-medium px-2 py-0.5">
                    Paused
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePause(slot.id)}
                  disabled={slot.toggling || slot.topicIds.length === 0}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-app-text-subtle hover:text-app-text hover:bg-app-hover transition-colors disabled:opacity-40"
                  title={slot.isPaused ? "Resume digest" : "Pause digest"}
                >
                  {slot.toggling
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : slot.isPaused
                    ? <Play className="w-3.5 h-3.5" />
                    : <Pause className="w-3.5 h-3.5" />
                  }
                </button>
                <button
                  onClick={() => removeSlot(slot.id)}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-app-text-subtle hover:text-error hover:bg-error-bg transition-colors"
                  title="Delete schedule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pickers row */}
            <div className="flex flex-wrap items-end gap-4 mb-5">
              {/* Frequency */}
              <div>
                <label className="block text-xs font-medium text-app-text-subtle mb-2">Frequency</label>
                <div className="flex gap-1.5">
                  {(["daily", "weekly"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => updateSlot(slot.id, { frequency: f })}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all active:scale-95 ${
                        slot.frequency === f
                          ? "border-app-text bg-app-text text-white"
                          : "border-app-border text-app-text-muted hover:border-app-border-strong"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day (weekly only) */}
              {slot.frequency === "weekly" && (
                <div>
                  <label className="block text-xs font-medium text-app-text-subtle mb-2">Day</label>
                  <div className="flex gap-1">
                    {DAYS.map((day, i) => (
                      <button
                        key={day}
                        onClick={() => updateSlot(slot.id, { dayOfWeek: i })}
                        className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                          slot.dayOfWeek === i
                            ? "border-app-text bg-app-text text-white"
                            : "border-app-border text-app-text-muted hover:border-app-border-strong"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time */}
              <div>
                <label className="block text-xs font-medium text-app-text-subtle mb-2">Time</label>
                <select
                  value={slot.hour}
                  onChange={(e) => updateSlot(slot.id, { hour: Number(e.target.value) })}
                  className="rounded-lg border border-app-border bg-app-surface px-2.5 py-1.5 text-xs text-app-text outline-none focus:border-app-border-strong transition-colors"
                >
                  {HOURS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-xs font-medium text-app-text-subtle mb-2">Timezone</label>
                <select
                  value={slot.timezone}
                  onChange={(e) => updateSlot(slot.id, { timezone: e.target.value })}
                  className="rounded-lg border border-app-border bg-app-surface px-2.5 py-1.5 text-xs text-app-text outline-none focus:border-app-border-strong transition-colors"
                >
                  {!TIMEZONES.includes(slot.timezone) && (
                    <option value={slot.timezone}>{slot.timezone}</option>
                  )}
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic chips */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-app-text-subtle mb-2">Topics</label>
              <div className="flex flex-wrap gap-2">
                {slotTopics.map((t) => (
                  <span
                    key={t.id}
                    className="flex items-center gap-1.5 rounded-full bg-app-hover border border-app-border px-3 py-1.5 text-sm font-medium text-app-text"
                  >
                    <span>{t.icon}</span>
                    {t.name}
                    <DigestPreviewModal topicId={t.id} topicName={t.name} topicIcon={t.icon} />
                    <button
                      onClick={() => unassignTopic(slot.id, t.id)}
                      className="flex items-center justify-center w-4 h-4 rounded-full bg-app-active hover:bg-app-border-strong transition-colors ml-0.5"
                    >
                      <span className="text-[10px] leading-none text-app-text-muted">✕</span>
                    </button>
                  </span>
                ))}

                {/* Add topic button */}
                <div className="relative">
                  <button
                    onClick={() => setShowTopicPicker(showTopicPicker === slot.id ? null : slot.id)}
                    className="flex items-center gap-1 rounded-full border border-dashed border-app-border px-3 py-1.5 text-xs font-medium text-app-text-muted hover:border-app-border-strong hover:text-app-text transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add topic
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>

                  {showTopicPicker === slot.id && addableTopics.length > 0 && (
                    <div className="absolute top-full left-0 mt-1.5 w-48 rounded-xl border border-app-border bg-app-surface shadow-lg z-10 py-1 overflow-hidden">
                      {addableTopics.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => assignTopic(slot.id, t.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-app-text hover:bg-app-hover transition-colors"
                        >
                          <span>{t.icon}</span>
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {showTopicPicker === slot.id && addableTopics.length === 0 && (
                    <div className="absolute top-full left-0 mt-1.5 w-44 rounded-xl border border-app-border bg-app-surface shadow-lg z-10 p-3">
                      <p className="text-xs text-app-text-subtle">All topics assigned</p>
                    </div>
                  )}
                </div>
              </div>

              {slotTopics.length === 0 && (
                <p className="text-xs text-app-text-subtle mt-1">No topics — add at least one to save.</p>
              )}
            </div>

            {/* Save row */}
            <div className="flex items-center gap-3 pt-4 border-t border-app-border">
              <button
                onClick={() => saveSlot(slot.id)}
                disabled={slot.saving || slot.topicIds.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-app-text px-4 py-2 text-xs font-semibold text-white hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {slot.saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {slot.saving ? "Saving…" : "Save schedule"}
              </button>
              {slot.saved && <span className="text-xs text-success font-medium">Saved ✓</span>}
              {slot.error && <span className="text-xs text-error">{slot.error}</span>}
            </div>
          </div>
        )
      })}

      {/* Unscheduled */}
      {unscheduled.length > 0 && (
        <div className="rounded-xl border border-dashed border-app-border p-5">
          <p className="text-xs font-semibold text-app-text-subtle uppercase tracking-widest mb-3">Unscheduled</p>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5 rounded-full border border-app-border px-3 py-1.5 text-sm text-app-text-subtle">
                <span>{t.icon}</span>
                {t.name}
              </span>
            ))}
          </div>
          <p className="text-xs text-app-text-subtle mt-3">Add a schedule above, then assign these topics to it.</p>
        </div>
      )}

      {/* Add schedule button */}
      <button
        onClick={addSlot}
        className="flex items-center gap-2 rounded-xl border border-dashed border-app-border w-full px-5 py-3.5 text-sm font-medium text-app-text-muted hover:border-app-border-strong hover:text-app-text hover:bg-app-hover active:scale-[0.99] transition-all"
      >
        <Plus className="w-4 h-4" />
        Add schedule
      </button>
    </div>
  )
}
