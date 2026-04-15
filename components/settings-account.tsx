"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Loader2, Pencil, X } from "lucide-react"
import { signOut } from "@/lib/auth-client"

type Props = {
  name: string
  email: string
  plan: string
}

export function SettingsAccount({ name, email, plan }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function save() {
    if (!draft.trim() || draft === name) {
      setEditing(false)
      return
    }

    setSaving(true)
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: draft.trim() }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setEditing(false)
    }
  }

  function cancel() {
    setDraft(name)
    setEditing(false)
  }

  async function deleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" })
      const { error } = await res.json()
      if (error) {
        console.error("[deleteAccount]", error)
        setDeleting(false)
        setConfirmDelete(false)
        return
      }
      await signOut()
      router.push("/")
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const isPro = plan === "pro"

  return (
    <div className="space-y-6">
      <div className="border-b border-app-border-subtle pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-text-subtle">Account</p>
        <h3 className="mt-2 text-lg font-semibold text-app-text">Identity and account</h3>
        <p className="mt-2 text-sm leading-6 text-app-text-muted">
          Keep the essentials together: your name, sign-in email, plan, and account controls.
        </p>
      </div>

      <section className="rounded-[1.25rem] border border-app-border-subtle bg-app-bg">
        <div className="border-b border-app-border-subtle px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-app-text-subtle">Personal info</p>
        </div>

        <div className="divide-y divide-app-border-subtle">
          <div className="flex items-center justify-between gap-4 px-4 py-4">
            <span className="w-24 shrink-0 text-sm text-app-text-muted">Name</span>
            {editing ? (
              <div className="ml-4 flex flex-1 items-center gap-2">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") save()
                    if (e.key === "Escape") cancel()
                  }}
                  className="flex-1 rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text placeholder:text-app-text-subtle focus:border-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent/30"
                />
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-app-text text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={cancel}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-app-border text-app-text-muted transition-colors hover:bg-app-hover"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="ml-4 flex flex-1 items-center justify-end gap-2">
                <span className="text-sm font-medium text-app-text">{saved ? draft : name}</span>
                <button
                  onClick={() => setEditing(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-app-text-muted transition-colors hover:bg-app-hover hover:text-app-text"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 px-4 py-4">
            <span className="w-24 shrink-0 text-sm text-app-text-muted">Email</span>
            <span className="ml-4 truncate text-sm text-app-text-muted">{email}</span>
          </div>
        </div>
      </section>

      <section className="rounded-[1.25rem] border border-app-border-subtle bg-app-bg">
        <div className="border-b border-app-border-subtle px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-app-text-subtle">Subscription</p>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <div className="text-sm font-medium text-app-text">Current plan</div>
            <div className="mt-1 text-xs text-app-text-subtle">Your active subscription tier.</div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isPro
                ? "bg-app-accent-light text-app-accent"
                : "bg-app-hover text-app-text-muted"
            }`}>
              {isPro ? "Pro" : "Free"}
            </span>
            {!isPro && (
              <Link href="/upgrade" className="text-xs font-medium text-app-accent transition-opacity hover:opacity-80">
                Upgrade to Pro &rarr;
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[1.25rem] border border-error/20 bg-white dark:bg-lp-surface">
        <div className="border-b border-error/10 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-app-text-subtle">Danger zone</p>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-app-text-muted">Permanently delete your account and all associated data.</p>
          <div className="mt-4">
            {confirmDelete ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="hidden text-xs text-app-text-muted sm:block">Are you sure?</span>
                <button
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="flex items-center gap-1.5 rounded-lg bg-error px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
                >
                  {deleting && <Loader2 className="h-3 w-3 animate-spin" />}
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-app-border px-5 py-2 text-sm font-medium text-app-text-muted transition-colors hover:bg-app-hover"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg border border-error/30 px-5 py-2 text-sm font-medium text-error transition-colors hover:bg-error-bg"
              >
                Delete account
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
