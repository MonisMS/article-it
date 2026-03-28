import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/admin"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { db } from "@/lib/db"
import { userTopics } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  // Onboarding gate — if user has no topics they haven't finished onboarding
  const firstTopic = await db.query.userTopics.findFirst({
    where: eq(userTopics.userId, session.user.id),
    columns: { userId: true },
  })
  if (!firstTopic) redirect("/onboarding")

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg dark:bg-[#0D1117]">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          user={{ name: session.user.name, email: session.user.email }}
          isAdmin={isAdmin(session.user.email)}
        />
      </div>

      {/* Main scrollable content — extra bottom padding on mobile for the nav bar */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <MobileNav />
    </div>
  )
}
