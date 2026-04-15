"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { BookOpen, Loader2 } from "lucide-react"
import { resetPassword } from "@/lib/auth-client"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }

    setLoading(true)

    const { error } = await resetPassword({ newPassword: password, token })

    setLoading(false)

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.")
      return
    }

    router.push("/sign-in?reset=1")
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-zinc-500 mb-4">Invalid or expired reset link.</p>
        <Link href="/forgot-password" className="text-sm font-medium text-zinc-900 hover:underline">
          Request a new one
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Set a new password</h1>
        <p className="mt-1.5 text-sm text-zinc-500">Must be at least 8 characters.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            autoFocus
            required
            minLength={8}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-colors"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-error-bg border border-error/20 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Saving…" : "Set new password"}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-zinc-900 mb-10">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          Curio
        </Link>

        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
