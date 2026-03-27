import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-[1.125rem] w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-1.5 py-0 text-[0.7rem] font-semibold tracking-wide whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-amber-100 text-amber-800 border-amber-200/60 [a]:hover:bg-amber-200/70",
        secondary:
          "bg-stone-100 text-stone-600 border-stone-200/60 [a]:hover:bg-stone-200/70",
        destructive:
          "bg-red-50 text-red-700 border-red-200/60 focus-visible:ring-red-500/20 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/60 [a]:hover:bg-red-100",
        outline:
          "border-border text-foreground [a]:hover:bg-[var(--color-app-surface-hover)] [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-[var(--color-app-surface-hover)] hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
