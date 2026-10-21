import * as React from "react";
import { cn } from "../../lib/cn.ts";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** A label rendered next to the box, so the whole row is the click target. */
  label?: React.ReactNode;
  /** A second line under the label in the muted ink. */
  description?: React.ReactNode;
}

/**
 * A native checkbox in the primary colour, as the apps and the installer
 * style theirs (accent-color, 16px). Native so it works with forms, keyboard
 * and assistive technology without any script. Give it a `label`, or an
 * `aria-label` when the label is elsewhere. `className` goes on the input
 * when there is no label, and on the wrapping row when there is.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, disabled, ...props }, ref) => {
    const generated = React.useId();
    const inputId = id ?? generated;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const input = (
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        disabled={disabled}
        aria-describedby={descriptionId}
        className={cn(
          "m-0 h-4 w-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          !label && className,
        )}
        {...props}
      />
    );
    if (!label) return input;
    // The description sits beside the label, not inside it, so the control's
    // accessible name stays the label and the description is its description.
    return (
      <div className={cn("grid gap-0.5", className)}>
        <label
          htmlFor={inputId}
          className={cn(
            "flex cursor-pointer items-start gap-2 text-sm font-medium",
            disabled && "cursor-not-allowed opacity-70",
          )}
        >
          <span className="flex h-5 items-center">{input}</span>
          <span>{label}</span>
        </label>
        {description && (
          <p
            id={descriptionId}
            className={cn("pl-6 text-xs text-muted-foreground", disabled && "opacity-70")}
          >
            {description}
          </p>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
