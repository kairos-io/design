import * as React from "react";
import { inputClasses } from "../Input/Input.tsx";
import { cn } from "../../lib/cn.ts";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Mono at 13px, for YAML, logs and anything an operator will copy. */
  mono?: boolean;
}

/** The multi-line text control, drawn like Input. Set `mono` for cloud configs and logs. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, mono, ...props }, ref) => (
    <textarea
      className={cn(inputClasses, "min-h-[80px] leading-normal", mono && "font-mono text-[13px]", className)}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
