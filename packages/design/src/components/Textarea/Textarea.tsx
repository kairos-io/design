import * as React from "react";
import { inputClasses } from "../Input/Input.tsx";
import { cn } from "../../lib/cn.ts";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Mono at 13px, for YAML, logs and anything an operator will copy. */
  mono?: boolean;
}

/**
 * The multi-line text control, drawn like Input. Set `mono` for a cloud
 * config, a log or anything an operator will copy.
 *
 * For a file edited by line, with a numbered gutter and a validator's marks,
 * reach for `CodeEditor` from `@kairos-io/design/code-editor` instead. This
 * control once carried its own `lineNumbers` and `highlight`; they kept a
 * hand-measured gutter in step with the control's scroll, and CodeMirror
 * does that properly.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, mono, ...props }, ref) => (
    <textarea
      className={cn(
        inputClasses,
        "min-h-[80px] leading-normal",
        mono && "font-mono text-[13px]",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
