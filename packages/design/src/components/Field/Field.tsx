import * as React from "react";
import { Label } from "../Label/Label.tsx";
import { cn } from "../../lib/cn.ts";

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The control's id. The label, help and error ids derive from it. */
  id: string;
  label: React.ReactNode;
  /** Help text under the control, in the muted ink. */
  help?: React.ReactNode;
  /** Error text under the control; sets aria-invalid on the control. */
  error?: React.ReactNode;
  required?: boolean;
  /** The control. Either an element (Input, Textarea, SelectTrigger...) that receives id, aria-describedby and aria-invalid, or a render function that gets them. */
  children: React.ReactElement | ((control: FieldControlProps) => React.ReactNode);
}

export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  /** The native attribute, so browser validation and `:required` styling apply. */
  required?: boolean;
  "aria-required"?: boolean;
}

/**
 * A labelled form control with optional help and error text, as the
 * installer's `.field`. It wires the ids: the control is described by its
 * help and error text, and an error marks it invalid.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ id, label, help, error, required, className, children, ...props }, ref) => {
    const helpId = help ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
    const control: FieldControlProps = {
      id,
      "aria-describedby": describedBy,
      "aria-invalid": error ? true : undefined,
      required: required || undefined,
      "aria-required": required || undefined,
    };
    return (
      <div ref={ref} className={cn("grid max-w-[640px] gap-1.5", className)} {...props}>
        <Label htmlFor={id}>
          {label}
          {required && (
            <span className="ml-0.5 text-status-recovery" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        {typeof children === "function"
          ? children(control)
          : React.cloneElement(children as React.ReactElement<FieldControlProps>, control)}
        {help && (
          <p id={helpId} className="text-[13px] text-muted">
            {help}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-[13px] text-status-recovery">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Field.displayName = "Field";
