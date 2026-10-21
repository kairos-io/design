import * as React from "react";
import { cn } from "../../lib/cn.ts";

export interface WizardStep {
  id: string;
  label: string;
}

export interface WizardStepsProps extends React.HTMLAttributes<HTMLElement> {
  steps: WizardStep[];
  /** The id of the step being shown. Steps before it are done, after it pending. */
  current: string;
  onStepChange?: (id: string) => void;
  /** The navigation landmark's name. */
  label?: string;
}

/**
 * The horizontal wizard rail of the build artifact deck: one tile bar per
 * step, ink for the steps behind, the accent for the current one, the
 * raised tone ahead, with a mono number or a check and the step's name.
 */
export const WizardSteps = React.forwardRef<HTMLElement, WizardStepsProps>(
  ({ steps, current, onStepChange, label = "Steps", className, ...props }, ref) => {
    const at = Math.max(0, steps.findIndex((s) => s.id === current));
    return (
      <nav ref={ref} aria-label={label} className={cn("flex gap-1 overflow-x-auto pb-0.5", className)} {...props}>
        {steps.map((step, i) => {
          const done = i < at;
          const isCurrent = i === at;
          return (
            <button
              key={step.id}
              type="button"
              aria-current={isCurrent ? "step" : undefined}
              data-state={done ? "done" : isCurrent ? "active" : "pending"}
              onClick={() => onStepChange?.(step.id)}
              className="flex min-w-[120px] flex-1 cursor-pointer flex-col gap-2 rounded-base px-1 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <svg viewBox="0 0 220 10" preserveAspectRatio="none" className="h-2 w-full" aria-hidden="true">
                <polygon
                  points="6,0 220,0 214,10 0,10"
                  className={done ? "fill-ink" : isCurrent ? "fill-accent" : "fill-raised"}
                />
              </svg>
              <span
                className={cn(
                  "flex items-center gap-2 text-[15px]",
                  isCurrent ? "font-bold text-ink" : done ? "font-semibold text-ink" : "font-semibold text-muted",
                )}
              >
                <span className="font-mono text-xs">{done ? "✓" : String(i + 1).padStart(2, "0")}</span>
                {step.label}
                <span className="sr-only">{done ? ", done" : isCurrent ? ", current" : ", not started"}</span>
              </span>
            </button>
          );
        })}
      </nav>
    );
  },
);
WizardSteps.displayName = "WizardSteps";
