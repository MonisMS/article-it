import { cn } from "@/lib/utils"

export function BetaBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-700",
        className
      )}
    >
      Beta
    </span>
  )
}
