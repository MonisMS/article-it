import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { TopicSuggestForm } from "@/components/topic-suggest-form"
import { getUserSuggestions } from "@/lib/db/queries/suggestions"

export default async function SuggestPage() {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  const suggestions = await getUserSuggestions(session.user.id)

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-8 sm:px-6">
      <header className="border-b border-stone-200/80 pb-8 dark:border-[#1E2A3A]">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-[#6B7585]">
            Suggest a topic
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6] sm:text-[2.4rem]">
            Help shape the library
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC] sm:text-base">
            Send us a topic you think belongs in ArticleIt. Strong suggestions help expand the library for everyone.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { step: "01", text: "Suggest a focused topic." },
            { step: "02", text: "We review the fit and source quality." },
            { step: "03", text: "Accepted topics are added to the library." },
          ].map(({ step, text }) => (
            <div key={step} className="rounded-xl border border-stone-200/80 bg-white/70 px-4 py-3 dark:border-[#1E2A3A] dark:bg-[#121925]/70">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-[#6B7585]">{step}</div>
              <div className="mt-2 text-sm leading-6 text-stone-700 dark:text-[#B8C0CC]">{text}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="py-8">
        <TopicSuggestForm initialSuggestions={suggestions} />
      </div>
    </div>
  )
}
