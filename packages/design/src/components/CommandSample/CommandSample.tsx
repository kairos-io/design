import * as React from "react";
import { cn } from "../../lib/cn.ts";

function useCopy(text: string) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(t);
  }, [copied]);
  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // No clipboard (an insecure context, a denied permission): the text is still selectable.
    }
  }, [text]);
  return { copied, copy };
}

export interface CommandSampleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The command, without the prompt. */
  command: string;
  /** The copy control's text. */
  copyLabel?: string;
}

/**
 * One command on a surface with a copy chip: the `docker pull` line in the
 * hadron-linux.io hero. The prompt is decoration; only the command is copied.
 */
export const CommandSample = React.forwardRef<HTMLDivElement, CommandSampleProps>(
  ({ command, copyLabel = "Copy", className, ...props }, ref) => {
    const { copied, copy } = useCopy(command);
    return (
      <div
        ref={ref}
        className={cn(
          "flex max-w-[560px] flex-wrap items-center gap-2.5 rounded-base bg-surface py-2 pr-2 pl-4 font-mono text-[13px] text-ink",
          className,
        )}
        {...props}
      >
        <span className="text-muted" aria-hidden="true">
          $
        </span>
        <code className="min-w-0 flex-1 [overflow-wrap:anywhere]">{command}</code>
        <button
          type="button"
          onClick={copy}
          aria-label={`${copyLabel} ${command}`}
          aria-live="polite"
          className="rounded-sm bg-raised px-2.5 py-1.5 font-sans text-[13px] font-semibold text-ink hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          {copied ? "Copied" : copyLabel}
        </button>
      </div>
    );
  },
);
CommandSample.displayName = "CommandSample";
