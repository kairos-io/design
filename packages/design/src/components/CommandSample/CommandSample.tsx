import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../../lib/cn.ts";
import { copyText, selectText } from "../../lib/clipboard.ts";
import { focusRing } from "../../lib/focus.ts";
import { useTransient } from "../../hooks/useTransient.ts";
import { ReserveWidth } from "../ReserveWidth/ReserveWidth.tsx";

type CopyState = "idle" | "copied" | "selected";

/**
 * Copies the command and reports what happened: "copied" when the clipboard
 * took it, "selected" when no clipboard is reachable (a plain http page with
 * no legacy copy either), in which case the command's text is selected so
 * the person can copy it by hand. Either state clears after a moment.
 */
function useCopy(text: string, target: React.RefObject<HTMLElement | null>) {
  const [state, setState] = useTransient<CopyState>("idle");
  const copy = React.useCallback(async () => {
    if (await copyText(text)) {
      setState("copied");
    } else {
      selectText(target.current);
      setState("selected");
    }
  }, [text, target, setState]);
  return { state, copy };
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
    const code = React.useRef<HTMLElement | null>(null);
    const { state, copy } = useCopy(command, code);
    const copied = state === "copied";
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
        <code ref={code} className="min-w-0 flex-1 [overflow-wrap:anywhere]">
          {command}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={`${copyLabel} ${command}`}
          aria-live="polite"
          data-copied={copied || undefined}
          data-selected={state === "selected" || undefined}
          className={cn(
            "rounded-sm px-2.5 py-1.5 font-sans text-[13px] font-semibold transition-colors",
            copied ? "bg-status-healthy text-status-ink" : "bg-raised text-ink hover:bg-hover",
            focusRing,
          )}
        >
          {/* Once copied the whole chip takes the filled success look of a status
              badge (healthy green, status ink), so the result is unmistakable at a
              glance; the ok tone on the raised chip alone would be too faint. The
              chip is held at the width of its "Copied" state so the row does not
              shift when the label changes. */}
          <ReserveWidth
            childClassName="inline-flex items-center gap-1.5"
            twinClassName="inline-flex items-center gap-1.5"
            twin={
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Copied
              </>
            }
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            )}
            {copied ? "Copied" : state === "selected" ? "Selected" : copyLabel}
          </ReserveWidth>
        </button>
      </div>
    );
  },
);
CommandSample.displayName = "CommandSample";
