import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn.ts";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  /** One sentence on what would fill the list. */
  description?: React.ReactNode;
  /** The way out: usually one primary button. */
  action?: React.ReactNode;
}

/** What a list shows when it has nothing to list. AuroraBoot's fleet/EmptyState.tsx. */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon, title, description, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col items-center justify-center gap-2 px-4 py-12 text-center", className)}
      {...props}
    >
      <Icon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";
