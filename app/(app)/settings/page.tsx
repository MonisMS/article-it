import { redirect } from "next/navigation"

type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function SettingsRedirectPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const target = tab ? `/profile?tab=${encodeURIComponent(tab)}` : "/profile"
  redirect(target)
}
