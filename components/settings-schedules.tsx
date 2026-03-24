"use client"

import { useState } from "react"
import { Plus, Trash2, Loader2, ChevronDown } from "lucide-react"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const label =
    i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`
  return { value: i, label }
})

type Topic = { id: string; name: string; icon: string | null }
type ScheduleRow = {
  topicId: string
  frequency: string
  dayOfWeek: number | null
  hour: number
  isActive: boolean
}
type Slot = {
  id: string
  frequency: "daily" | "weekly"
  dayOfWeek: number
  hour: number
  topicIds: string[]
  saving: boolean
  saved: boolean
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
        topicIds: [],
        saving: false,
        saved: false,
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

  // topics not assigned to any slot
  const scheduledTopicIds = new Set(slots.flatMap((s) => s.topicIds))
  const unscheduled = topics.filter((t) => !scheduledTopicIds.has(t.id))

  function addSlot() {
    setSlots((prev) => [
      ...prev,
      { id: `slot-${nextId++}`, frequency: "weekly", dayOfWeek: 1, hour: 9, topicIds: [], saving: false, saved: false },
    ])
  }

  function removeSlot(slotId: string) {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return
    // delete schedules for topics in this slot
    for (const topicId of slot.topicIds) {
      fetch("/api/user/schedule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      }).catch(() => {})
    }
    setSlots((prev) => prev.filter((s) => s.id !== slotId))
  }

  function updateSlot(slotId: string, patch: Partial<Omit<Slot, "id" | "saving" | "saved">>) {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, ...patch, saved: false } : s))
    )
  }

  function assignTopic(slotId: string, topicId: string) {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) return { ...s, topicIds: [...s.topicIds, topicId], saved: false }
        // remove from other slots
        return { ...s, topicIds: s.topicIds.filter((id) => id !== topicId) }
      })
    )
    setShowTopicPicker(null)
  }

  function unassignTopic(slotId: string, topicId: string) {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId ? { ...s, topicIds: s.topicIds.filter((id) => id !== topicId), saved: false } : s
      )
    )
    // remove schedule from DB
    fetch("/api/user/schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId }),
    }).catch(() => {})
  }

  async function saveSlot(slotId: string) {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot || slot.topicIds.length === 0) return

    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, saving: true } : s)))

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    await Promise.all(
      slot.topicIds.map((topicId) =>
        fetch("/api/user/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frequency: slot.frequency,
            dayOfWeek: slot.frequency === "weekly" ? slot.dayOfWeek : null,
            hour: slot.hour,
            timezone: tz,
            topicId,
          }),
        })
      )
    )

    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, saving: false, saved: true } : s))
    )
  }

  return (
    <div className="space-y-4">
      {slots.map((slot) => {
        const slotTopics = topics.filter((t) => slot.topicIds.includes(t.id))
        const addableTopics = topics.filter(
          (t) => !scheduledTopicIds.has(t.id) || slot.topicIds.includes(t.id)
        ).filter((t) => !slot.topicIds.includes(t.id))

        return (
          <div key={slot.id} className="rounded-xl border border-zinc-200 bg-white p-5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-zinc-700">Schedule</p>
              <button
                onClick={() => removeSlot(slot.id)}
                className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete schedule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pickers row */}
            <div className="flex flex-wrap items-end gap-4 mb-5">
              {/* Frequency */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Frequency</label>
                <div className="flex gap-1.5">
                  {(["daily", "weekly"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => updateSlot(slot.id, { frequency: f })}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all active:scale-95 ${
                        slot.frequency === f
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
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
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Day</label>
                  <div className="flex gap-1">
                    {DAYS.map((day, i) => (
                      <button
                        key={day}
                        onClick={() => updateSlot(slot.id, { dayOfWeek: i })}
                        className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                          slot.dayOfWeek === i
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
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
                <label className="block text-xs font-medium text-zinc-400 mb-2">Time</label>
                <select
                  value={slot.hour}
                  onChange={(e) => updateSlot(slot.id, { hour: Number(e.target.value) })}
                  className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-400 transition-colors"
                >
                  {HOURS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic chips */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-zinc-400 mb-2">Topics</label>
              <div className="flex flex-wrap gap-2">
                {slotTopics.map((t) => (
                  <span
                    key={t.id}
                    className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700"
                  >
                    <span>{t.icon}</span>
                    {t.name}
                    <button
                      onClick={() => unassignTopic(slot.id, t.id)}
                      className="flex items-center justify-center w-4 h-4 rounded-full bg-zinc-300/60 hover:bg-zinc-300 transition-colors ml-0.5"
                    >
                      <span className="text-[10px] leading-none text-zinc-600">✕</span>
                    </button>
                  </span>
                ))}

                {/* Add topic button */}
                <div className="relative">
                  <button
                    onClick={() => setShowTopicPicker(showTopicPicker === slot.id ? null : slot.id)}
                    className="flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add topic
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>

                  {showTopicPicker === slot.id && addableTopics.length > 0 && (
                    <div className="absolute top-full left-0 mt-1.5 w-48 rounded-xl border border-zinc-200 bg-white shadow-lg z-10 py-1 overflow-hidden">
                      {addableTopics.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => assignTopic(slot.id, t.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          <span>{t.icon}</span>
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {showTopicPicker === slot.id && addableTopics.length === 0 && (
                    <div className="absolute top-full left-0 mt-1.5 w-44 rounded-xl border border-zinc-200 bg-white shadow-lg z-10 p-3">
                      <p className="text-xs text-zinc-400">All topics assigned</p>
                    </div>
                  )}
                </div>
              </div>

              {slotTopics.length === 0 && (
                <p className="text-xs text-zinc-400 mt-1">No topics — add at least one to save.</p>
              )}
            </div>

            {/* Save row */}
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
              <button
                onClick={() => saveSlot(slot.id)}
                disabled={slot.saving || slot.topicIds.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {slot.saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {slot.saving ? "Saving…" : "Save schedule"}
              </button>
              {slot.saved && <span className="text-xs text-emerald-600 font-medium">Saved ✓</span>}
            </div>
          </div>
        )
      })}

      {/* Unscheduled */}
      {unscheduled.length > 0 && (
        <div className="rounded-xl border border-dashed border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Unscheduled</p>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-400">
                <span>{t.icon}</span>
                {t.name}
              </span>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-3">Add a schedule above, then assign these topics to it.</p>
        </div>
      )}

      {/* Add schedule button */}
      <button
        onClick={addSlot}
        className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 w-full px-5 py-3.5 text-sm font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 active:scale-[0.99] transition-all"
      >
        <Plus className="w-4 h-4" />
        Add schedule
      </button>
    </div>
  )
}
