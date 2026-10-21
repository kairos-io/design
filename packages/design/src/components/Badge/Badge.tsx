import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.ts";

export const badgeVariants = cva(
  "inline-flex items-center rounded-base border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-accent text-on-accent hover:bg-accent/80",
        secondary: "border-transparent bg-raised text-ink hover:bg-raised/80",
        destructive: "border-transparent bg-status-recovery text-status-ink hover:bg-status-recovery/80",
        outline: "text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/** A small label for a count, a version or a category, as AuroraBoot's ui/badge.tsx. A span, so it can sit inside a heading or a table cell. For a status, use StatusBadge. */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";
