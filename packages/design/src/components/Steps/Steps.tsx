import * as React from "react";
import { Check, Play, X } from "lucide-react";
import { cn } from "../../lib/cn.ts";

export type StepState = "pending" | "active" | "done" | "failed";

export interface StepItem {
  id: string;
  label: string;
  state: StepState;
}

export interface StepsProps extends React.OlHTMLAttributes<HTMLOListElement> {
  items: StepItem[];
  /** Required: what the list tracks ("Installation steps"). */
  "aria-label": string;
}

const markerStyles: Record<StepState, string> = {
  pending: "border-border bg-background",
  active: "border-primary bg-primary text-primary-foreground",
  done: "border-success/30 bg-success/15 text-success-foreground",
  failed: "border-danger/30 bg-danger/15 text-danger-foreground",
};

const rowStyles: Record<StepState, string> = {
  pending: "text-muted-foreground",
  active: "font-medium text-foreground",
  done: "text-foreground",
  failed: "font-medium text-danger-foreground",
};

const stateText: Record<StepState, string> = {
  pending: "not started",
  active: "in progress",
  done: "done",
  failed: "failed",
};

/**
 * The progress checklist of a long operation, as the installer's progress
 * page draws it: a marker per step, the current step in the primary colour,
 * done in success and failed in danger. The state is also written out for
 * assistive technology.
 */
export const Steps = React.forwardRef<HTMLOListElement, StepsProps>(({ items, className, ...props }, ref) => {
  return (
    <ol ref={ref} className={cn("grid list-none gap-1 p-0", className)} {...props}>
      {items.map((item) => (
        <li
          key={item.id}
          data-state={item.state}
          aria-current={item.state === "active" ? "step" : undefined}
          className={cn("flex items-center gap-2.5 px-1 py-1.5 text-sm", rowStyles[item.state])}
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
              markerStyles[item.state],
            )}
          >
            {item.state === "done" && <Check className="h-3.5 w-3.5" />}
            {item.state === "active" && <Play className="h-2.5 w-2.5 fill-current" />}
            {item.state === "failed" && <X className="h-3.5 w-3.5" />}
          </span>
          <span>{item.label}</span>
          <span className="sr-only">, {stateText[item.state]}</span>
        </li>
      ))}
    </ol>
  );
});
Steps.displayName = "Steps";
