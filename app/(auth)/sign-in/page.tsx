"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BookOpen, Loader2 } from "lucide-react"
import { signIn } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justReset = searchParams.get("reset") === "1"
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 p-12 text-white">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgba(217,119,6,0.15),transparent_60%)] pointer-events-none" />

        <Link href="/" className="relative flex items-center gap-2.5 font-semibold text-white">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <BookOpen className="w-4.5 h-4.5 text-amber-400" />
          </span>
          <span className="text-lg">ArticleIt</span>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-light italic leading-snug text-stone-100">
            Your topics.<br />Your schedule.<br />Your inbox.
          </h2>
          <p className="mt-5 text-stone-400 text-sm leading-relaxed">
            Welcome back. Your personalised feed and digests are waiting.
          </p>
        </div>

        <div className="relative text-xs text-stone-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-stone-300 hover:text-white transition-colors">
            Sign up for free
          </Link>
        </div>
      </div>

      {/* ── Right panel / Form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-8 py-12 bg-stone-50">
        {/* Mobile logo */}
        <Link
          href="/"
          className="lg:hidden flex items-center gap-2 font-semibold text-stone-900 mb-8"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900 text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          ArticleIt
        </Link>

        <div className="w-full max-w-sm animate-in fade-in duration-300">
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
              <p className="mt-1.5 text-sm text-stone-500">
                Sign in to your account to continue.
              </p>
            </div>

            {justReset && (
              <div className="mb-6 rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                Password updated. Sign in with your new password.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-10 px-3.5"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-stone-500 hover:text-stone-800 transition-colors">
                    Forgot password?
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
                  className="h-10 px-3.5"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg text-sm font-semibold"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-stone-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-stone-900 hover:underline"
            >
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
