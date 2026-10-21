import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.ts";

export const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-sm font-mono text-xs leading-4 transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
  {
    variants: {
      variant: {
        /** The tag of the Foundations deck: a raised chip in mono. "hadron v0.5.1", "k3s 1.36". */
        default: "bg-raised px-2 py-1 text-ink",
        /** The same as default; kept for callers that chose it when default was the accent. */
        secondary: "bg-raised px-2 py-1 text-ink",
        /** A hairline instead of a fill: "group: retail-eu". */
        outline: "border border-line px-[7px] py-[3px] text-ink",
        /** The accent, for the one count that must be seen: unread, new. */
        accent: "bg-accent px-2 py-1 font-semibold text-on-accent",
        destructive: "bg-status-recovery px-2 py-1 font-semibold text-status-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/**
 * A tag: a version, an architecture, a group, a count. Mono, 12px, a 2px
 * radius, as the Foundations deck draws its tags. A span, so it can sit
 * inside a heading or a table cell. For a status, use StatusBadge.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";
