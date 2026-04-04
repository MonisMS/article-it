"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Loader2 } from "lucide-react"
import { signUp, authClient, signInWithGoogle, signInWithGitHub } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function getPasswordStrength(password: string): { score: number; label: string; color: string; width: string } {
  if (!password) return { score: 0, label: "", color: "", width: "0%" }
  let classes = 0
  if (/[a-z]/.test(password)) classes++
  if (/[A-Z]/.test(password)) classes++
  if (/[0-9]/.test(password)) classes++
  if (/[^a-zA-Z0-9]/.test(password)) classes++

  if (classes === 1) return { score: 1, label: "Weak", color: "bg-red-500", width: "33%" }
  if (classes === 2) return { score: 2, label: "Fair", color: "bg-amber-500", width: "66%" }
  return { score: 3, label: "Strong", color: "bg-green-500", width: "100%" }
}

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null)

  async function handleOAuth(provider: "google" | "github") {
    setOauthLoading(provider)
    if (provider === "google") await signInWithGoogle()
    else await signInWithGitHub()
    setOauthLoading(null)
  }

  const strength = getPasswordStrength(form.password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.")
      setLoading(false)
      return
    }

    await authClient.emailOtp.sendVerificationOtp({
      email: form.email,
      type: "email-verification",
    })

    router.push("/verify-email?email=" + encodeURIComponent(form.email))
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
          <blockquote className="text-3xl font-light italic leading-snug text-stone-100">
            &ldquo;I used to spend 30 minutes every morning hunting for good
            articles. Now they&apos;re just there.&rdquo;
          </blockquote>
          <div className="mt-6">
            <p className="text-sm font-medium text-stone-200">Alex Chen</p>
            <p className="text-xs text-stone-500 mt-0.5">Early adopter</p>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          {[
            ["12+", "Topics covered"],
            ["200+", "RSS sources"],
            ["Daily", "Feed updates"],
            ["Free", "To get started"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
            >
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="mt-1 text-xs text-stone-400">{label}</div>
            </div>
          ))}
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
              <h1 className="text-2xl font-bold text-stone-900">Create your account</h1>
              <p className="mt-1.5 text-sm text-stone-500">
                Free forever. No credit card required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Full name
                </label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-10 px-3.5"
                />
              </div>

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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-10 px-3.5"
                />
                {form.password && (
                  <div className="mt-2">
                    <div className="h-1 rounded-full bg-stone-100">
                      <div
                        style={{ width: strength.width }}
                        className={`h-1 rounded-full transition-all duration-300 ${strength.color}`}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${
                      strength.score === 1 ? "text-red-500" :
                      strength.score === 2 ? "text-amber-600" :
                      "text-green-600"
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}
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
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </div>

          <div className="mt-5">
            <div className="relative flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400 font-medium">or sign up with</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-lg border border-stone-200 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                {oauthLoading === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                )}
                Google
              </button>
              <button
                onClick={() => handleOAuth("github")}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-lg border border-stone-200 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                {oauthLoading === "github" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                )}
                GitHub
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-stone-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
