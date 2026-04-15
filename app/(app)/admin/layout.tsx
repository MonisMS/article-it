import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/admin"
import { AdminTabs } from "@/components/admin-tabs"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")
  if (!isAdmin(session.user.email)) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="border-b border-stone-200/80 pb-6 dark:border-[#1E2A3A]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
          Admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6]">
          Manage the library
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-500 dark:text-[#6B7585]">
          Manage topics, RSS sources, assignments, and user suggestions.
        </p>
      </div>
      <AdminTabs />
      {children}
    </div>
  )
}
