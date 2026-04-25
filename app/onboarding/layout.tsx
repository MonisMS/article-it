import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    redirect("/sign-in")
  }
  if (!session) redirect("/sign-in")

  return <>{children}</>
}
