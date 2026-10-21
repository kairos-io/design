import * as React from "react";
import { cn } from "../../lib/cn.ts";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** The single-line text control, as AuroraBoot's ui/input.tsx. Pair it with Label, or use Field for label, help and error together. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-danger aria-invalid:ring-danger disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
