"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Loader2 } from "lucide-react"
import { signUp } from "@/lib/auth-client"

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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

    router.push("/onboarding")
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-900 p-12 text-white">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
            <BookOpen className="w-4 h-4" />
          </span>
          ArticleIt
        </Link>

        <div>
          <blockquote className="text-2xl font-medium leading-snug text-zinc-100">
            &ldquo;I used to spend 30 minutes every morning hunting for good
            articles. Now they&apos;re just there.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-zinc-400">— Early user</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["12+", "Topics covered"],
            ["200+", "RSS sources"],
            ["Daily", "Feed updates"],
            ["Free", "To get started"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl bg-white/5 p-4">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="mt-0.5 text-zinc-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel / Form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-8 py-12">
        {/* Mobile logo */}
        <Link
          href="/"
          className="lg:hidden flex items-center gap-2 font-semibold text-zinc-900 mb-8"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          ArticleIt
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">Create your account</h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Free forever. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 mb-1.5"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-zinc-900 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
