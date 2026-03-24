"use client"

import Link from "next/link"
import { BookOpen, Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-zinc-900 mb-10">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          ArticleIt
        </Link>

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-100 mx-auto mb-6">
          <Mail className="w-6 h-6 text-zinc-600" />
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Check your inbox</h1>
        <p className="text-sm text-zinc-500 leading-relaxed mb-8">
          We sent a verification link to your email address. Click it to confirm your account and continue.
        </p>

        <p className="text-xs text-zinc-400">
          Already verified?{" "}
          <Link href="/sign-in" className="text-zinc-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
