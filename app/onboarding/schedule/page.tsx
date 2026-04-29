"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Loader2,
  ChevronUp,
  ChevronDown,
  Check,
  Mail,
  CalendarDays,
  Repeat,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function formatHour(h: number): string {
  if (h === 0) return "12:00 AM"
  if (h < 12) return `${h}:00 AM`
  if (h === 12) return "12:00 PM"
  return `${h - 12}:00 PM`
}

function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return "UTC"
  }
}

// ─── Background ───────────────────────────────────────────────────────────────

function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-app-bg">
      <div className="absolute left-1/2 -top-40 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-app-accent/8 blur-[80px]" />
      <div className="absolute -right-32 bottom-0 h-[320px] w-[320px] rounded-full bg-app-accent/6 blur-[90px]" />
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300 ${
              step < current
                ? "bg-app-accent text-white"
                : step === current
                ? "bg-app-accent-light border border-app-accent text-app-accent"
                : "bg-app-surface border border-app-border text-app-text-subtle"
            }`}
          >
            {step < current ? <Check className="w-3 h-3" strokeWidth={3} /> : step}
          </div>
          {step < 3 && (
            <div className="relative w-10 h-px bg-app-border">
              <div
                className="absolute inset-y-0 left-0 bg-app-accent transition-all duration-500"
                style={{ width: current > step ? "100%" : "0%" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Frequency option ─────────────────────────────────────────────────────────

function FrequencyOption({
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
}: {
  value: "daily" | "weekly"
  label: string
  description: string
  icon: React.ElementType
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-start gap-3.5 rounded-2xl border p-4 text-left cursor-pointer transition-all duration-200 shadow-sm ${
        selected
          ? "bg-app-accent-light border-app-accent/40"
          : "bg-app-surface border-app-border hover:bg-app-surface-hover hover:border-app-border-strong hover:shadow-md"
      }`}
      style={
        selected
          ? { boxShadow: "0 0 0 1px rgba(194,104,10,0.25), 0 4px 16px rgba(194,104,10,0.10)" }
          : undefined
      }
    >
      <div
        className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? "bg-app-accent text-white" : "bg-app-surface-hover text-app-text-muted"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className={`text-sm font-semibold ${selected ? "text-app-accent" : "text-app-text"}`}>
          {label}
        </p>
        <p className="text-xs text-app-text-subtle mt-0.5">{description}</p>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-3 right-3 w-5 h-5 rounded-full bg-app-accent flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ─── Time picker ──────────────────────────────────────────────────────────────

function TimePicker({ hour, onChange }: { hour: number; onChange: (h: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange((hour + 1) % 24)}
        className="w-8 h-8 rounded-full bg-app-surface-hover hover:bg-app-surface-active border border-app-border flex items-center justify-center text-app-text-muted hover:text-app-text transition-colors"
      >
        <ChevronUp className="w-4 h-4" />
      </motion.button>

      <div className="relative overflow-hidden py-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={hour}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="text-3xl font-semibold text-app-text tabular-nums tracking-tight text-center w-36"
          >
            {formatHour(hour)}
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange((hour - 1 + 24) % 24)}
        className="w-8 h-8 rounded-full bg-app-surface-hover hover:bg-app-surface-active border border-app-border flex items-center justify-center text-app-text-muted hover:text-app-text transition-colors"
      >
        <ChevronDown className="w-4 h-4" />
      </motion.button>
    </div>
  )
}

// ─── Live digest preview card ─────────────────────────────────────────────────

function DigestPreviewCard({
  frequency,
  dayOfWeek,
  hour,
  timezone,
}: {
  frequency: "daily" | "weekly"
  dayOfWeek: number
  hour: number
  timezone: string
}) {
  const scheduleText =
    frequency === "daily"
      ? `Every day at ${formatHour(hour)}`
      : `Every ${DAYS_FULL[dayOfWeek]} at ${formatHour(hour)}`

  return (
    <motion.div
      layout
      className="rounded-2xl border border-app-border bg-app-surface shadow-sm shadow-black/5 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-app-border flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-app-accent flex items-center justify-center flex-shrink-0">
          <Mail className="w-3 h-3 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-app-text truncate">Your Curio digest</p>
          <p className="text-[10px] text-app-text-subtle truncate">digest@m0nis.com</p>
        </div>
        <span className="ml-auto text-[10px] text-app-text-subtle flex-shrink-0">preview</span>
      </div>

      <div className="px-4 pt-3 pb-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={scheduleText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5 bg-app-accent-light border border-app-accent/25 text-app-accent text-xs font-medium px-2.5 py-1 rounded-full"
          >
            <CalendarDays className="w-3 h-3" />
            {scheduleText}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-4 pb-4 pt-3 space-y-2.5">
        {[
          { label: "Top article from your feed" },
          { label: "Curated just for you" },
          { label: "Hand-picked this week" },
        ].map(({ label }, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-1 h-1 rounded-full bg-app-accent/50 flex-shrink-0" />
            <div className="flex-1 h-7 rounded-xl bg-app-surface-hover flex items-center px-3">
              <span className="text-[10px] text-app-text-subtle">{label}</span>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-app-text-subtle pl-3">+ more articles from your topics</p>
      </div>

      <div className="px-4 py-2.5 border-t border-app-border flex items-center justify-between">
        <p className="text-[10px] text-app-text-subtle">{timezone}</p>
        <p className="text-[10px] text-app-accent/60">Unsubscribe</p>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const router = useRouter()
  const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly")
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [hour, setHour] = useState(9)
  const [timezone] = useState(() => {
    try {
      return detectTimezone()
    } catch {
      return "UTC"
    }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

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

    router.push("/onboarding/share")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageBackground />

      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="flex items-center gap-2.5 font-semibold text-app-text">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-app-accent text-white">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          Curio
        </div>
        <StepIndicator current={2} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-semibold text-app-text tracking-tight">
              When should we{" "}
              <span className="text-app-accent">reach you?</span>
            </h1>
            <p className="mt-3 text-app-text-muted text-base">
              Set your digest schedule. You can change this anytime.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="space-y-5"
            >
              <div>
                <p className="text-xs font-semibold text-app-text-subtle uppercase tracking-widest mb-3">
                  How often?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <FrequencyOption
                    value="daily"
                    label="Daily"
                    description="Fresh articles every morning"
                    icon={Repeat}
                    selected={frequency === "daily"}
                    onSelect={() => setFrequency("daily")}
                  />
                  <FrequencyOption
                    value="weekly"
                    label="Weekly"
                    description="One curated batch a week"
                    icon={CalendarDays}
                    selected={frequency === "weekly"}
                    onSelect={() => setFrequency("weekly")}
                  />
                </div>
              </div>

              <AnimatePresence>
                {frequency === "weekly" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs font-semibold text-app-text-subtle uppercase tracking-widest mb-3">
                      Which day?
                    </p>
                    <div className="flex gap-2">
                      {DAYS.map((day, i) => (
                        <motion.button
                          key={day}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => setDayOfWeek(i)}
                          className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                            dayOfWeek === i
                              ? "bg-app-accent text-white shadow-sm shadow-black/10"
                              : "bg-app-surface border border-app-border text-app-text-muted hover:bg-app-surface-hover hover:text-app-text"
                          }`}
                        >
                          {day}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <p className="text-xs font-semibold text-app-text-subtle uppercase tracking-widest mb-4">
                  What time?
                </p>
                <div className="flex items-center justify-center gap-6 bg-app-surface border border-app-border rounded-2xl py-5 shadow-sm shadow-black/5">
                  <TimePicker hour={hour} onChange={setHour} />
                </div>
                <p className="text-xs text-app-text-subtle text-center mt-2.5">
                  Use ↑↓ to adjust the hour
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-sm text-red-600"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFinish}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-app-accent hover:opacity-90 text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-sm shadow-black/10 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Setting up your feed…" : "Take me to my feed →"}
                </motion.button>
                <button
                  onClick={() => router.push("/onboarding/share")}
                  className="text-center text-sm text-app-text-subtle hover:text-app-text-muted transition-colors py-1"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="lg:sticky lg:top-8"
            >
              <p className="text-xs font-semibold text-app-text-subtle uppercase tracking-widest mb-3">
                Preview
              </p>
              <DigestPreviewCard
                frequency={frequency}
                dayOfWeek={dayOfWeek}
                hour={hour}
                timezone={timezone}
              />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
