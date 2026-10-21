import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { StatusDot } from "../StatusDot/StatusDot.tsx";

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

const rowStyles: Record<StepState, string> = {
  pending: "text-muted",
  active: "font-medium text-ink",
  done: "text-ink",
  failed: "font-medium text-status-recovery",
};

const stateText: Record<StepState, string> = {
  pending: "not started",
  active: "in progress",
  done: "done",
  failed: "failed",
};

/**
 * The progress checklist of a long operation: a status diamond per step,
 * the current step filled with the accent, done steps healthy green, failed
 * steps recovery red, steps ahead an outline. The state is also written out
 * for assistive technology.
 */
export const Steps = React.forwardRef<HTMLOListElement, StepsProps>(({ items, className, ...props }, ref) => {
  return (
    <ol ref={ref} className={cn("grid list-none gap-1 p-0", className)} {...props}>
      {items.map((item) => (
        <li
          key={item.id}
          data-state={item.state}
          aria-current={item.state === "active" ? "step" : undefined}
          className={cn("flex items-center gap-2.5 px-1 py-[7px] text-sm", rowStyles[item.state])}
        >
          <StatusDot
            size={11}
            tone={item.state === "done" ? "success" : item.state === "failed" ? "danger" : item.state === "active" ? "info" : "neutral"}
            outline={item.state === "pending"}
          />
          <span>{item.label}</span>
          <span className="sr-only">, {stateText[item.state]}</span>
        </li>
      ))}
    </ol>
  );
});
Steps.displayName = "Steps";
