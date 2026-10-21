import * as React from "react";
import { cn } from "../../lib/cn.ts";

export interface TerminalLine {
  text: string;
  /** Rendered in the terminal's error colour. */
  error?: boolean;
}

export interface TerminalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The lines to show; strings are plain lines. */
  lines: Array<string | TerminalLine>;
  /** Keeps the newest line in view as lines arrive. */
  autoscroll?: boolean;
  /** Required: what this output is ("Installation log"). */
  "aria-label": string;
  /** The panel's max height; it scrolls past it. */
  maxHeight?: string | number;
}

/**
 * The log panel: navy in both themes, monospace, streamed line by line. The
 * installer's `.output-box` and AuroraBoot's `.terminal-output`. Text only:
 * the output is never rendered as HTML.
 */
export const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  ({ lines, autoscroll = true, maxHeight = "70vh", className, ...props }, ref) => {
    const inner = React.useRef<HTMLDivElement | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        inner.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    React.useEffect(() => {
      if (autoscroll && inner.current) {
        inner.current.scrollTop = inner.current.scrollHeight;
      }
    }, [lines, autoscroll]);

    return (
      <div
        ref={setRefs}
        role="log"
        aria-live="polite"
        tabIndex={0}
        style={{ maxHeight }}
        className={cn(
          "overflow-y-auto rounded-lg bg-code p-4 font-mono text-[13px] leading-normal text-code-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
          className,
        )}
        {...props}
      >
        <pre className="m-0 whitespace-pre-wrap font-[inherit] text-[inherit] wrap-anywhere">
          {lines.map((line, i) => {
            const l = typeof line === "string" ? { text: line } : line;
            return (
              <div key={i} className={cn(l.error && "text-status-recovery")}>
                {l.text}
              </div>
            );
          })}
        </pre>
      </div>
    );
  },
);
Terminal.displayName = "Terminal";
