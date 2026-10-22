import * as React from "react";
import { cn } from "../../lib/cn.ts";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Mono at 13px, for a value an operator reads character by character: a hostname, a disk path, an image reference. */
  mono?: boolean;
}

/** The input classes, shared with the select trigger and the textarea so the three controls match. */
export const inputClasses =
  "w-full rounded-base border-[1.5px] border-line bg-surface px-3 py-2.5 text-[15px] leading-tight text-ink transition-colors placeholder:text-muted focus-visible:border-ink focus-visible:outline-none aria-invalid:border-status-recovery disabled:cursor-not-allowed disabled:bg-raised disabled:text-muted";

/**
 * The single-line text control of the Foundations deck: a surface with a
 * 1.5px hairline that turns to ink when focused, and to the recovery red
 * when invalid. Pair it with Label, or use Field for label, help and error
 * together.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, mono, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        inputClasses,
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-ink",
        mono && "font-mono text-[13px]",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";
