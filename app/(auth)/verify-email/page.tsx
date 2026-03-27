"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { BookOpen, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"

function VerifyEmailForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get("email") ?? ""

  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await authClient.emailOtp.verifyEmail({ email, otp })

    if (error) {
      setError(error.message ?? "Invalid or expired code. Please try again.")
      setLoading(false)
      return
    }

    router.push("/onboarding")
  }

  async function handleResend() {
    setResent(false)
    await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    })
    setResent(true)
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

        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Check your inbox</h1>
        <p className="text-sm text-zinc-500 leading-relaxed mb-8">
          We sent a 6-digit code to <span className="font-medium text-zinc-700">{email}</span>. Enter it below to verify your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-center text-2xl font-bold tracking-widest text-zinc-900 placeholder:text-zinc-300 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-colors"
          />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Didn&apos;t get a code?{" "}
          <button
            onClick={handleResend}
            className="font-medium text-zinc-900 hover:underline"
          >
            Resend
          </button>
          {resent && <span className="ml-2 text-green-600">Sent!</span>}
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  )
}
