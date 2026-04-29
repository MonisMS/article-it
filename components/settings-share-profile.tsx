"use client"

import { useEffect, useRef, useState } from "react"
import { Check, CheckCircle2, Globe, EyeOff, Link2, Loader2, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type CheckState = "idle" | "checking" | "available" | "taken" | "error"

type Props = {
  initialUsername: string | null
  initialPublic: boolean
}

export function SettingsShareProfile({ initialUsername, initialPublic }: Props) {
  const [username, setUsername] = useState(initialUsername ?? "")
  const [isPublic, setIsPublic] = useState(initialPublic)
  const [checkState, setCheckState] = useState<CheckState>(initialUsername ? "idle" : "idle")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitial = useRef(true)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  const profileUrl = username ? `${appUrl}/p/${username}` : null

  useEffect(() => {
    // Don't check the initial value loaded from DB — it's already claimed by this user
    if (isInitial.current) {
      isInitial.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaved(false)
    if (!username || username.length < 2) {
      setCheckState("idle")
      return
    }
    // If unchanged from what's saved, skip check
    if (username === (initialUsername ?? "")) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  async function save(overridePublic?: boolean) {
    if (checkState === "taken") return
    const targetPublic = overridePublic ?? isPublic
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/user/public-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim() || undefined,
          publicProfile: targetPublic,
        }),
      })
      const { data, error: err } = await res.json()
      if (err) {
        setError(err)
      } else {
        if (data?.username !== undefined) setUsername(data.username ?? "")
        if (data?.publicProfile !== undefined) setIsPublic(data.publicProfile)
        setCheckState("idle")
        setSaved(true)
      }
    } catch {
      setError("Failed to save. Try again.")
    } finally {
      setSaving(false)
    }
  }

  async function togglePublic() {
    const next = !isPublic
    setIsPublic(next)
    await save(next)
  }

  async function copyLink() {
    if (!profileUrl) return
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canSave = username.trim().length >= 2 && checkState !== "taken" && checkState !== "checking" && checkState !== "error"

  return (
    <div className="space-y-5">
      <div className="border-b border-app-border-subtle pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-text-subtle">Public profile</p>
        <h3 className="mt-2 text-lg font-semibold text-app-text">Share your reading list</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-app-text-muted">
          Get a public URL — anyone can see your topics and recent highlights, and follow your exact setup with one click.
        </p>
      </div>

      {/* Username input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-app-text-subtle mb-2">
          Username
        </label>
        <div className="flex gap-2">
          <div className="flex items-center flex-1 rounded-xl border border-app-border bg-app-bg overflow-hidden focus-within:border-app-accent focus-within:ring-2 focus-within:ring-app-accent/15 transition-all shadow-xs shadow-black/5">
            <span className="pl-3 pr-1 text-sm text-app-text-subtle whitespace-nowrap select-none font-medium">
              /p/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && canSave && save()}
              placeholder="your-username"
              maxLength={30}
              className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-app-text placeholder:text-app-text-subtle focus:outline-none"
            />
            {checkState === "checking" && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-app-text-subtle mr-3" />
            )}
            {checkState === "available" && (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-3" />
            )}
            {checkState === "taken" && (
              <XCircle className="w-3.5 h-3.5 text-red-500 mr-3" />
            )}
          </div>
          <button
            onClick={() => save()}
            disabled={saving || !canSave}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-app-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all shadow-sm shadow-black/10"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : "Save"}
          </button>
        </div>

        {/* Availability / status line */}
        <div className="mt-2 h-5 px-1">
          <AnimatePresence mode="wait">
            {checkState === "taken" && (
              <motion.p key="taken" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Username already taken
              </motion.p>
            )}
            {checkState === "available" && (
              <motion.p key="available" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {username} is available
              </motion.p>
            )}
            {saved && checkState === "idle" && (
              <motion.p key="saved" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-app-accent flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved
              </motion.p>
            )}
            {error && (
              <motion.p key="error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-500">
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Visibility + copy row */}
      {username && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-app-border bg-app-bg px-4 py-3 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isPublic
                ? <Globe className="w-4 h-4 text-green-500 shrink-0" />
                : <EyeOff className="w-4 h-4 text-app-text-subtle shrink-0" />
              }
              <span className="text-sm text-app-text-muted truncate">
                {isPublic
                  ? profileUrl
                  : "Private — only you can see"}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isPublic && (
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 text-xs font-medium text-app-text-muted hover:text-app-text transition-colors"
                >
                  {copied
                    ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                    : <><Link2 className="w-3.5 h-3.5" /> Copy</>
                  }
                </button>
              )}
              <button
                role="switch"
                aria-checked={isPublic}
                onClick={togglePublic}
                disabled={saving}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${isPublic ? "bg-green-500" : "bg-app-border-strong"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isPublic ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
