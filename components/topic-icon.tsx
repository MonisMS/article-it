import { cn } from "@/lib/utils"
import { getTopicIcon } from "@/lib/topic-icons"

interface TopicIconProps {
  slug: string
  className?: string
  size?: number
}

export function TopicIcon({ slug, className, size = 18 }: TopicIconProps) {
  const Icon = getTopicIcon(slug)
  return <Icon width={size} height={size} className={cn("shrink-0", className)} />
}
