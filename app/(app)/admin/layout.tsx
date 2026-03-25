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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Admin</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage topics, RSS sources, and user suggestions.</p>
      </div>
      <AdminTabs />
      {children}
    </div>
  )
}
