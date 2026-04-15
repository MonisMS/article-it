"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BookOpen, Loader2 } from "lucide-react"
import { signIn, signInWithGoogle, signInWithGitHub } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const LEFT_QUOTE = "I used to spend 30 minutes\nfinding good articles.\nNow they’re just there."

const SUPPORTING = "Curated from 200+ sources across 12+ topics"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justReset = searchParams.get("reset") === "1"
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null)

  async function handleOAuth(provider: "google" | "github") {
    setOauthLoading(provider)
    if (provider === "google") await signInWithGoogle()
    else await signInWithGitHub()
    setOauthLoading(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await signIn.email({
      email: form.email,
      password: form.password,
    })

    if (error) {
      const isServerError = error.status === 500 || (error as { statusCode?: number }).statusCode === 500
      setError(isServerError ? "Server error. Please try again in a moment." : (error.message ?? "Invalid email or password."))
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2 bg-app-bg">
      {/* Soft edge so it feels like one system */}
      <div
        aria-hidden
        className="pointer-events-none hidden lg:block absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 bg-linear-to-r from-app-accent/0 via-app-accent/6 to-app-accent/0"
      />

      {/* ── Left: clean, structured ───────────────────────────── */}
      <div className="relative hidden lg:flex flex-col overflow-hidden px-12 py-12">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-app-accent/10 blur-[70px]" />
          <div className="absolute -right-30 top-24 h-72 w-72 rounded-full bg-app-accent/8 blur-[80px]" />
          <div className="absolute inset-0 bg-linear-to-br from-app-bg via-app-surface-hover to-app-accent-light/50" />
        </div>

        {/* Center the content block so it doesn't hug the far-left edge */}
        <div className="relative z-10 mx-auto w-full max-w-xl flex flex-col flex-1">
          <Link href="/" className="flex items-center gap-2 text-app-text font-semibold">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-app-accent text-white shadow-sm shadow-black/10">
              <BookOpen className="w-4.5 h-4.5" />
            </span>
            Curio
          </Link>

          <div className="flex-1 flex items-center">
            <div className="w-full max-w-[450px]">
              <blockquote className="text-4xl font-semibold tracking-tight leading-[1.18] text-app-text whitespace-pre-line">
                “{LEFT_QUOTE}”
              </blockquote>
              <p className="mt-6 text-sm text-app-text-muted leading-relaxed">{SUPPORTING}</p>

              <div className="mt-10 text-xs text-app-text-subtle">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="text-app-text hover:text-app-accent transition-colors font-semibold">
                  Sign up for free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: form ───────────────────────────────────────── */}
      <div className="relative flex items-center justify-center px-4 sm:px-8 py-14 overflow-hidden">
        {/* Subtle warm wash so the right side doesn't feel empty */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-app-accent/8 blur-[90px]" />
          <div className="absolute left-10 -bottom-28 h-80 w-80 rounded-full bg-app-accent/6 blur-[110px]" />
          <div className="absolute inset-0 bg-linear-to-br from-app-bg via-app-surface-hover to-app-accent-light/35" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 font-semibold text-app-text mb-10">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-app-accent text-white shadow-sm shadow-black/10">
              <BookOpen className="w-4.5 h-4.5" />
            </span>
            Curio
          </Link>

          <div className="relative rounded-4xl bg-white shadow-(--shadow-card) p-9 sm:p-10 animate-in fade-in duration-500">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-app-text">Welcome back</h1>
              <p className="mt-2 text-sm text-app-text-muted">Sign in to continue.</p>
            </div>

            {justReset && (
              <div className="mb-6 rounded-2xl bg-green-50/70 px-4 py-3 text-sm text-green-800 shadow-(--shadow-xs)">
                Password updated. Sign in with your new password.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-app-text mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12.5 rounded-xl px-4 !bg-white border border-app-border shadow-(--shadow-xs) placeholder:text-gray-400 transition-all duration-200 ease-out focus-visible:!bg-white focus-visible:border-app-accent focus-visible:ring-[3px] focus-visible:ring-app-accent/15"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-app-text">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-app-text-muted hover:text-app-text transition-colors">
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-12.5 rounded-xl px-4 !bg-white border border-app-border shadow-(--shadow-xs) placeholder:text-gray-400 transition-all duration-200 ease-out focus-visible:!bg-white focus-visible:border-app-accent focus-visible:ring-[3px] focus-visible:ring-app-accent/15"
                />
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50/70 px-4 py-3 text-sm text-red-700 shadow-(--shadow-xs)">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full h-13 rounded-xl bg-app-accent text-white shadow-sm shadow-black/10 transition-all duration-200 ease-out hover:brightness-95 hover:-translate-y-px active:translate-y-0 disabled:translate-y-0"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="mt-7">
              <div className="relative flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-app-border" />
                <span className="text-xs text-app-text-subtle font-medium">or continue with</span>
                <div className="flex-1 h-px bg-app-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOAuth("google")}
                  disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-app-surface shadow-xs shadow-black/5 text-sm font-semibold text-app-text-muted hover:text-app-text hover:-translate-y-0.5 hover:shadow-sm transition-all disabled:opacity-50"
                >
                  {oauthLoading === "google" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  )}
                  Google
                </button>
                <button
                  onClick={() => handleOAuth("github")}
                  disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-app-surface shadow-xs shadow-black/5 text-sm font-semibold text-app-text-muted hover:text-app-text hover:-translate-y-0.5 hover:shadow-sm transition-all disabled:opacity-50"
                >
                  {oauthLoading === "github" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  )}
                  GitHub
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-app-text-muted lg:hidden">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-semibold text-app-text hover:text-app-accent transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
