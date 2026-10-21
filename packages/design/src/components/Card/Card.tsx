import * as React from "react";
import { cn } from "../../lib/cn.ts";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A hairline around the surface. The decks' cards have none: the tone step from the canvas is the edge. */
  bordered?: boolean;
}

/** The surface everything sits on: `--surface` on the canvas, a 4px radius, no shadow, as the Foundations deck draws its cards. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, bordered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-base bg-surface text-ink", bordered && "border border-line", className)}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

/** The card's name: 18px, with the product in bold where there is one ("**Kairos** console"). */
export const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-lg leading-tight font-semibold tracking-[-0.01em]", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

/** Body copy on the surface, in `--sub`. */
export const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm leading-[1.45] text-sub", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

/** A small label over a figure: "Healthy", "Nodes". 13px in `--muted`. */
export const CardLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-[13px] leading-snug text-muted", className)} {...props} />
  ),
);
CardLabel.displayName = "CardLabel";

/** The figure itself: "98.6%". 34px semibold with tight tracking and tabular digits. */
export const CardValue = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-[34px] leading-none font-semibold tracking-[-0.03em] tabular-nums", className)}
      {...props}
    />
  ),
);
CardValue.displayName = "CardValue";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";
