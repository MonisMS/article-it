"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Check, CheckCircle2, Link2, Loader2, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

// ─── Availability indicator ───────────────────────────────────────────────────

type CheckState = "idle" | "checking" | "available" | "taken" | "error"

function AvailabilityBadge({ state, username }: { state: CheckState; username: string }) {
  if (state === "idle" || !username) return null
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={state}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className={`inline-flex items-center gap-1 text-xs font-medium ${
          state === "checking" ? "text-app-text-subtle"
          : state === "available" ? "text-green-600"
          : "text-red-500"
        }`}
      >
        {state === "checking" && <Loader2 className="w-3 h-3 animate-spin" />}
        {state === "available" && <CheckCircle2 className="w-3 h-3" />}
        {(state === "taken" || state === "error") && <XCircle className="w-3 h-3" />}
        {state === "checking" ? "Checking…"
          : state === "available" ? `${username} is available`
          : state === "taken" ? "Username already taken"
          : "Try a different username"}
      </motion.span>
    </AnimatePresence>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingSharePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [checkState, setCheckState] = useState<CheckState>("idle")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  const previewUrl = username ? `${appUrl}/p/${username}` : null

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!username || username.length < 2) {
      setCheckState("idle")
      return
    }
    setCheckState("checking")
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/user/username-check?username=${encodeURIComponent(username)}`)
        const { available } = await res.json()
        setCheckState(available ? "available" : "taken")
      } catch {
        setCheckState("error")
      }
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [username])

  async function handleSave() {
    if (!username || checkState !== "available") return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/user/public-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), publicProfile: true }),
      })
      const { error: err } = await res.json()
      if (err) { setError(err); setSaving(false); return }
      setSaved(true)
      setTimeout(() => router.push("/dashboard"), 1200)
    } catch {
      setError("Failed to save. Try again.")
      setSaving(false)
    }
  }

  function handleSkip() {
    router.push("/dashboard")
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
        <StepIndicator current={3} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl sm:text-5xl font-semibold text-app-text tracking-tight">
              Share your{" "}
              <span className="text-app-accent">reading list.</span>
            </h1>
            <p className="mt-3 text-app-text-muted text-base leading-relaxed">
              Pick a username and get a public page anyone can visit — they can follow your exact topics with one click.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="space-y-5"
          >
            {/* Username input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-app-text-subtle mb-3">
                Your username
              </label>
              <div className="flex items-center rounded-2xl border border-app-border bg-app-surface shadow-sm shadow-black/5 overflow-hidden focus-within:border-app-accent focus-within:ring-2 focus-within:ring-app-accent/15 transition-all">
                <span className="pl-4 pr-1 text-sm text-app-text-subtle whitespace-nowrap select-none font-medium">
                  /p/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="your-username"
                  maxLength={30}
                  autoFocus
                  className="flex-1 bg-transparent py-3.5 pr-4 text-sm text-app-text placeholder:text-app-text-subtle focus:outline-none"
                />
              </div>
              <div className="mt-2 h-5 flex items-center px-1">
                <AvailabilityBadge state={checkState} username={username} />
              </div>
            </div>

            {/* URL preview */}
            <AnimatePresence>
              {checkState === "available" && previewUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 rounded-2xl border border-app-accent/25 bg-app-accent-light px-4 py-3">
                    <Link2 className="w-4 h-4 text-app-accent shrink-0" />
                    <p className="text-sm text-app-accent font-medium truncate">{previewUrl}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold text-sm py-3.5 rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Profile created! Heading to your feed…
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving || checkState !== "available"}
                    className="w-full flex items-center justify-center gap-2 bg-app-accent hover:opacity-90 text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-sm shadow-black/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? "Saving…" : "Claim this username →"}
                  </motion.button>
                )}
              </AnimatePresence>

              <button
                onClick={handleSkip}
                className="text-center text-sm text-app-text-subtle hover:text-app-text-muted transition-colors py-1"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
