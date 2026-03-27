"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Loader2 } from "lucide-react"
import { signUp, authClient } from "@/lib/auth-client"
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

          <p className="mt-5 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-stone-900 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
