"use client"

import { useState } from "react"
import { Link2, Check, Loader2, Globe, EyeOff } from "lucide-react"

type Props = {
  initialUsername: string | null
  initialPublic: boolean
}

export function SettingsShareProfile({ initialUsername, initialPublic }: Props) {
  const [username, setUsername] = useState(initialUsername ?? "")
  const [isPublic, setIsPublic] = useState(initialPublic)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const profileUrl = username
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/p/${username}`
    : null

  async function save(newPublic?: boolean) {
    const targetPublic = newPublic ?? isPublic
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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-lp-text">Share your reading list</h3>
        <p className="text-xs text-stone-500 dark:text-lp-text-muted mt-0.5">
          Make your profile public so others can follow your topics with one click.
        </p>
      </div>

      {/* Username input */}
      <div className="flex items-center gap-2">
        <div className="flex items-center flex-1 rounded-xl border border-stone-200 dark:border-lp-border bg-stone-50 dark:bg-lp-bg overflow-hidden">
          <span className="pl-3 pr-1 text-sm text-stone-400 dark:text-lp-text-subtle whitespace-nowrap select-none">
            /p/
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="your-username"
            maxLength={30}
            className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-stone-900 dark:text-lp-text placeholder:text-stone-300 dark:placeholder:text-lp-text-subtle focus:outline-none"
          />
        </div>
        <button
          onClick={() => save()}
          disabled={saving || !username.trim()}
          className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-amber-500 text-white dark:text-lp-bg text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Toggle public / copy link row */}
      {username && (
        <div className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-lp-border bg-white dark:bg-lp-surface px-4 py-3">
          <div className="flex items-center gap-2.5">
            {isPublic
              ? <Globe className="w-4 h-4 text-green-500" />
              : <EyeOff className="w-4 h-4 text-stone-400 dark:text-lp-text-subtle" />
            }
            <span className="text-sm text-stone-700 dark:text-lp-text-muted">
              {isPublic ? "Public — anyone with the link can view" : "Private — only you can see"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isPublic && (
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-lp-text-muted hover:text-stone-900 dark:hover:text-lp-text transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link2 className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy link"}
              </button>
            )}
            <button
              role="switch"
              aria-checked={isPublic}
              onClick={togglePublic}
              disabled={saving}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50
                ${isPublic ? "bg-green-500" : "bg-stone-200 dark:bg-lp-elevated"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                  ${isPublic ? "translate-x-4" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
