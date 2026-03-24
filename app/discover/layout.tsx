import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { Nav } from "@/components/nav"

export default async function DiscoverLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    return (
      <div className="flex h-screen overflow-hidden bg-zinc-50">
        <div className="hidden md:flex flex-shrink-0">
          <Sidebar user={{ name: session.user.name, email: session.user.email }} />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    )
  }

  return (
    <>
      <Nav />
      <main className="flex-1 pt-16">{children}</main>
    </>
  )
}
