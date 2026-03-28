import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getUserSuggestions } from "@/lib/db/queries/suggestions"
import { TopicSuggestForm } from "@/components/topic-suggest-form"
import { Lightbulb } from "lucide-react"

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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="pt-10 pb-6 px-4 sm:px-6 border-b border-stone-200 dark:border-[#1E2A3A] bg-gradient-to-b from-stone-50 dark:from-[#161C26]/50 to-transparent">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-[#F0EDE6] tracking-tight">Suggest a topic</h1>
            <p className="text-stone-400 dark:text-[#6B7585] text-sm mt-1 leading-relaxed">
              Help us grow the library. Every suggestion is reviewed and the best ones get added.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { step: "1", text: "Submit your idea" },
            { step: "2", text: "We review it" },
            { step: "3", text: "Gets added for everyone" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </span>
              <span className="text-xs text-stone-500">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-8">
        <TopicSuggestForm initialSuggestions={suggestions} />
      </div>
    </div>
  )
}
