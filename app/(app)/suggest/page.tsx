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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Suggest a Topic</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Help us grow the topic library. We review all suggestions.
        </p>
      </div>

      <TopicSuggestForm initialSuggestions={suggestions} />
    </div>
  )
}
