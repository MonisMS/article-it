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

// ─── Background (same as step 1) ──────────────────────────────────────────────

function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#080C12]">
      <div
        className="absolute -top-60 -right-40 w-[500px] h-[500px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, #d97706 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "aurora-pulse 9s ease-in-out infinite 1s",
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "aurora-pulse 11s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  )
}

// ─── Step indicator (same as step 1) ─────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300 ${
              step < current
                ? "bg-amber-500 text-black"
                : step === current
                ? "bg-amber-500/20 border border-amber-500 text-amber-400"
                : "bg-white/10 border border-white/10 text-white/30"
            }`}
          >
            {step < current ? <Check className="w-3 h-3" strokeWidth={3} /> : step}
          </div>
          {step < 2 && (
            <div className="relative w-12 h-px bg-white/10">
              <div
                className="absolute inset-y-0 left-0 bg-amber-500 transition-all duration-500"
                style={{ width: current > 1 ? "100%" : "0%" }}
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
      className={`relative flex items-start gap-3.5 rounded-2xl border p-4 text-left cursor-pointer transition-colors duration-200 ${
        selected
          ? "bg-amber-500/10 border-amber-500/50"
          : "bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20"
      }`}
      style={
        selected
          ? { boxShadow: "0 0 20px rgba(245,158,11,0.15), inset 0 0 0 1px rgba(245,158,11,0.3)" }
          : undefined
      }
    >
      <div
        className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? "bg-amber-500 text-black" : "bg-white/10 text-white/50"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className={`text-sm font-semibold ${selected ? "text-amber-300" : "text-white/90"}`}>
          {label}
        </p>
        <p className="text-xs text-white/40 mt-0.5">{description}</p>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-black" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ─── Time picker ──────────────────────────────────────────────────────────────

function TimePicker({ hour, onChange }: { hour: number; onChange: (h: number) => void }) {
  function increment() {
    onChange((hour + 1) % 24)
  }
  function decrement() {
    onChange((hour - 1 + 24) % 24)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={increment}
        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
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
            className="text-3xl font-bold text-white tabular-nums tracking-tight text-center w-36"
          >
            {formatHour(hour)}
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={decrement}
        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
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
      className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm overflow-hidden"
    >
      {/* Email header */}
      <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
          <Mail className="w-3 h-3 text-black" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white/80 truncate">Your Curio digest</p>
          <p className="text-[10px] text-white/35 truncate">digest@m0nis.com</p>
        </div>
        <span className="ml-auto text-[10px] text-white/25 flex-shrink-0">preview</span>
      </div>

      {/* Schedule badge */}
      <div className="px-4 pt-3 pb-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={scheduleText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            <CalendarDays className="w-3 h-3" />
            {scheduleText}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mock article list */}
      <div className="px-4 pb-4 pt-3 space-y-2.5">
        {[
          { label: "Top article from your feed" },
          { label: "Curated just for you" },
          { label: "Hand-picked this week" },
        ].map(({ label }, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-1 h-1 rounded-full bg-amber-500/50 flex-shrink-0" />
            <div className="flex-1 h-3 rounded-full bg-white/[0.06] flex items-center pl-2">
              <span className="text-[9px] text-white/20">{label}</span>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-white/20 pl-3">+ more articles from your topics</p>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between">
        <p className="text-[10px] text-white/20">{timezone}</p>
        <p className="text-[10px] text-amber-500/50">Unsubscribe</p>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const router = useRouter()
  const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly")
  const [dayOfWeek, setDayOfWeek] = useState(1) // Monday
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

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuroraBackground />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="flex items-center gap-2.5 font-semibold text-white">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-black">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          <span className="text-white/90">Curio</span>
        </div>
        <StepIndicator current={2} />
      </header>

      {/* Main — two-column on desktop */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-3xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              When should we{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                reach you?
              </span>
            </h1>
            <p className="mt-3 text-white/50 text-base">
              Set your digest schedule. You can change this anytime.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            {/* Left — controls */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="space-y-5"
            >
              {/* Frequency */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
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

              {/* Day of week (weekly only) */}
              <AnimatePresence>
                {frequency === "weekly" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
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
                              ? "bg-amber-500 text-black shadow-[0_0_16px_rgba(245,158,11,0.3)]"
                              : "bg-white/[0.05] border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
                          }`}
                        >
                          {day}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Time */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                  What time?
                </p>
                <div className="flex items-center justify-center gap-6 bg-white/[0.04] border border-white/10 rounded-2xl py-5">
                  <TimePicker hour={hour} onChange={setHour} />
                </div>
                <p className="text-xs text-white/25 text-center mt-2.5">
                  Use ↑↓ to adjust the hour
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-sm text-red-400"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFinish}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-semibold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Setting up your feed…" : "Take me to my feed →"}
                </motion.button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-center text-sm text-white/25 hover:text-white/50 transition-colors py-1"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>

            {/* Right — live preview */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="lg:sticky lg:top-8"
            >
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
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
