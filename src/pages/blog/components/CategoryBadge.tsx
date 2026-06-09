import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const categoryBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        solid:
          "border-transparent bg-foreground text-background",
        outline:
          "border-foreground/30 text-foreground/60 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
)

interface CategoryBadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof categoryBadgeVariants> {
  asChild?: boolean
}

function CategoryBadge({
  className,
  variant,
  asChild = false,
  ...props
}: CategoryBadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="category-badge"
      className={cn(categoryBadgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { CategoryBadge, categoryBadgeVariants }