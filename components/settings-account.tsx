"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Pencil, Check, X } from "lucide-react"
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
    if (!draft.trim() || draft === name) { setEditing(false); return }
    setSaving(true)
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: draft.trim() }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setEditing(false) }
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
    <>
      <div className="space-y-8">
        {/* Personal info */}
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold text-app-text-subtle uppercase tracking-widest">Personal info</p>
            <p className="mt-1 text-sm text-app-text-muted">Update your name and review your email.</p>
          </div>
          <div className="divide-y divide-app-border-subtle rounded-xl border border-app-border-subtle bg-app-bg">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm text-app-text-muted w-20 shrink-0">Name</span>
              {editing ? (
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel() }}
                    className="flex-1 rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text placeholder:text-app-text-subtle focus:outline-none focus:ring-2 focus:ring-app-accent/30 focus:border-app-accent"
                  />
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-app-text text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={cancel}
                    className="flex items-center justify-center w-7 h-7 rounded-full border border-app-border text-app-text-muted hover:bg-app-hover transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1 ml-4 justify-end">
                  <span className="text-sm font-medium text-app-text">{saved ? draft : name}</span>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center justify-center w-6 h-6 rounded-full text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm text-app-text-muted w-20 shrink-0">Email</span>
              <span className="text-sm text-app-text-muted ml-4 truncate">{email}</span>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold text-app-text-subtle uppercase tracking-widest">Subscription</p>
            <p className="mt-1 text-sm text-app-text-muted">Manage your plan and upgrade when you’re ready.</p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-app-border-subtle bg-app-bg px-4 py-4">
            <div>
              <div className="text-sm font-medium text-app-text">Plan</div>
              <div className="mt-1 text-xs text-app-text-subtle">Your current subscription tier.</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center ${
                isPro
                  ? "rounded-full bg-app-accent-light text-app-accent text-xs font-semibold px-3 py-1"
                  : "rounded-full bg-app-hover text-app-text-muted text-xs font-medium px-3 py-1"
              }`}>
                {isPro ? "Pro" : "Free"}
              </span>
              {!isPro && (
                <Link href="/upgrade" className="text-xs font-medium text-app-accent hover:opacity-80 transition-opacity">
                  Upgrade to Pro →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold text-app-text-subtle uppercase tracking-widest">Danger zone</p>
            <p className="mt-1 text-sm text-app-text-muted">Permanently deletes your account and all data.</p>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-app-text-muted hidden sm:block">Are you sure?</span>
              <button
                onClick={deleteAccount}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg bg-error px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-colors"
              >
                {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-app-border px-5 py-2 text-sm font-medium text-app-text-muted hover:bg-app-hover transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-error/30 text-error text-sm font-medium px-5 py-2 hover:bg-error-bg transition-colors"
            >
              Delete account
            </button>
          )}
        </div>
      </div>
    </>
  )
}
