"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
    <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
      {/* Name row */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm text-zinc-500 w-20 flex-shrink-0">Name</span>
        {editing ? (
          <div className="flex items-center gap-2 flex-1 ml-4">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel() }}
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 transition-colors"
            />
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={cancel}
              className="flex items-center justify-center w-7 h-7 rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 ml-4 justify-end">
            <span className="text-sm font-medium text-zinc-900">{saved ? draft : name}</span>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center justify-center w-6 h-6 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Email row */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm text-zinc-500 w-20 flex-shrink-0">Email</span>
        <span className="text-sm font-medium text-zinc-900 ml-4">{email}</span>
      </div>

      {/* Plan row */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm text-zinc-500 w-20 flex-shrink-0">Plan</span>
        <div className="flex items-center gap-3 ml-4">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isPro
              ? "bg-violet-100 text-violet-700"
              : "bg-zinc-100 text-zinc-600"
          }`}>
            {isPro ? "Pro" : "Free"}
          </span>
          {!isPro && (
            <button className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors">
              Upgrade to Pro →
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Danger zone */}

    <div className="mt-8 rounded-xl border border-red-100 bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-medium text-zinc-900">Delete account</p>
          <p className="text-xs text-zinc-400 mt-0.5">Permanently deletes your account and all data.</p>
        </div>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 hidden sm:block">Are you sure?</span>
            <button
              onClick={deleteAccount}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete account
          </button>
        )}
      </div>
    </div>
    </>
  )
}
