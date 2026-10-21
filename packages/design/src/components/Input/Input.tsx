import * as React from "react";
import { cn } from "../../lib/cn.ts";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** The single-line text control, as AuroraBoot's ui/input.tsx. Pair it with Label, or use Field for label, help and error together. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-9 w-full rounded-base border border-line bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink aria-invalid:border-status-recovery aria-invalid:ring-status-recovery disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
