import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { focusRingOffset } from "../../lib/focus.ts";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** The setting's name, beside the track. Without it, give the switch an aria-label. */
  label?: React.ReactNode;
  /** A short note after the label in the muted ink. */
  description?: React.ReactNode;
}

/**
 * An on/off setting: the provisioning and security toggles of the build
 * wizard. A square-cornered track in the accent when on, the raised tone
 * when off; a button with role switch, so Space and Enter flip it.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, label, description, className, onClick, disabled, ...props }, ref) => {
    const id = React.useId();
    return (
      <span className={cn("inline-flex items-center gap-3 text-[15px]", className)}>
        <button
          ref={ref}
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={description ? `${id}-description` : undefined}
          disabled={disabled}
          onClick={(e) => {
            onClick?.(e);
            onCheckedChange?.(!checked);
          }}
          className={cn(
            `flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-sm p-0.5 transition-colors duration-[var(--duration-fast)] ease-out ${focusRingOffset} disabled:cursor-not-allowed disabled:opacity-50`,
            checked ? "bg-accent" : "bg-raised",
          )}
          {...props}
        >
          {/* The thumb slides the 16px of free track on a transform, over the same
              fast duration the track's colour takes, so both move as one. */}
          <span
            aria-hidden="true"
            className={cn(
              "block h-4 w-4 rounded-sm bg-status-ink transition-transform duration-[var(--duration-fast)] ease-out",
              checked && "translate-x-4",
            )}
          />
        </button>
        {label && (
          <label id={`${id}-label`} htmlFor={id} className="cursor-pointer font-semibold text-ink">
            {label}
          </label>
        )}
        {description && (
          <span id={`${id}-description`} className="text-sm text-muted">
            {description}
          </span>
        )}
      </span>
    );
  },
);
Switch.displayName = "Switch";
