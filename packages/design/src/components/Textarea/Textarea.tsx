import * as React from "react";
import { cn } from "../../lib/cn.ts";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** The multi-line text control, as AuroraBoot's ui/textarea.tsx. Add `font-mono` for YAML and logs. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-danger aria-invalid:ring-danger disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
