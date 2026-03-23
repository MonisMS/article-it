import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar user={{ name: session.user.name, email: session.user.email }} />
      </div>

      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
