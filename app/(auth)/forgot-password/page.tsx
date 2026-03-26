"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Loader2, ArrowLeft } from "lucide-react"
import { requestPasswordReset } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    })

    setLoading(false)

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.")
      return
    }

    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-zinc-900 mb-10">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          ArticleIt
        </Link>

        {sent ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Check your inbox</h1>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              If an account exists for <span className="font-medium text-zinc-700">{email}</span>, we sent a password reset link. Check your spam folder if you don&apos;t see it.
            </p>
            <Link href="/sign-in" className="text-sm font-medium text-zinc-900 hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-zinc-900">Forgot your password?</h1>
              <p className="mt-1.5 text-sm text-zinc-500">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <Link
              href="/sign-in"
              className="mt-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
