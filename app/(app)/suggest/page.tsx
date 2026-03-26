import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getUserSuggestions } from "@/lib/db/queries/suggestions"
import { TopicSuggestForm } from "@/components/topic-suggest-form"

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
      <div className="pt-10 pb-8 px-4 sm:px-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-app-text tracking-tight">Suggest a Topic</h1>
        <p className="text-app-text-muted text-sm mt-2 max-w-md leading-relaxed">
          Help us grow the topic library. We review all suggestions.
        </p>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl">
        <TopicSuggestForm initialSuggestions={suggestions} />
      </div>
    </div>
  )
}
