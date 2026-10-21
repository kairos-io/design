import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../../lib/cn.ts";

export interface TerminalLine {
  text: string;
  /** Rendered in the recovery red. */
  error?: boolean;
  /** A command the reader could type: the line starts with a "$" prompt in the key colour. */
  prompt?: boolean;
}

export interface TerminalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title" | "onCopy"> {
  /** The lines to show; strings are plain lines. */
  lines: Array<string | TerminalLine>;
  /** Keeps the newest line in view as lines arrive. */
  autoscroll?: boolean;
  /** Required: what this output is ("Installation log"). */
  "aria-label": string;
  /** The body's max height; it scrolls past it. */
  maxHeight?: string | number;
  /** The bar's title. "terminal" by default; pass `null` to drop the bar. */
  title?: string | null;
  /** Shows a copy action in the bar that copies every line (prompt lines without the "$"). */
  copy?: boolean;
  /** Called after a copy; the default writes the text to the clipboard. */
  onCopy?: (text: string) => void;
}

function normalise(line: string | TerminalLine): TerminalLine {
  return typeof line === "string" ? { text: line } : line;
}

/**
 * The code block and log panel of the Foundations deck: the dark code
 * ground in both themes, a bar with the title and a copy action, Martian
 * Mono at 13px with a loose line height, the "$" prompt in the key colour.
 * Streamed logs scroll to the newest line. Text only: the output is never
 * rendered as HTML.
 */
export const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  (
    { lines, autoscroll = true, maxHeight = "70vh", title = "terminal", copy = false, onCopy, className, ...props },
    ref,
  ) => {
    const inner = React.useRef<HTMLDivElement | null>(null);
    const [copied, setCopied] = React.useState(false);
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

    React.useEffect(() => {
      if (!copied) return;
      const t = setTimeout(() => setCopied(false), 1500);
      return () => clearTimeout(t);
    }, [copied]);

    const handleCopy = () => {
      const text = lines.map((l) => normalise(l).text).join("\n");
      if (onCopy) onCopy(text);
      else {
        try {
          void navigator.clipboard?.writeText(text);
        } catch {
          // No clipboard (an insecure page, an old browser): the action is a no-op.
        }
      }
      setCopied(true);
    };

    const { "aria-label": label, ...rest } = props;

    return (
      <div className={cn("overflow-hidden rounded-base bg-code text-code-ink", className)} {...rest}>
        {title !== null && (
          <div className="flex items-center justify-between gap-3 bg-code-bar px-3.5 py-2 font-mono text-xs leading-4 text-code-muted">
            <span>{title}</span>
            {copy && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-sm font-mono text-xs text-code-muted transition-colors hover:text-code-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-code-ink"
              >
                {copied ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
                {copied ? "copied" : "copy"}
              </button>
            )}
          </div>
        )}
        <div
          ref={setRefs}
          role="log"
          aria-live="polite"
          aria-label={label}
          tabIndex={0}
          style={{ maxHeight }}
          className="overflow-y-auto p-3.5 font-mono text-[13px] leading-[1.8] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-code-ink"
        >
          <pre className="m-0 whitespace-pre-wrap font-[inherit] text-[inherit] wrap-anywhere">
            {lines.map((line, i) => {
              const l = normalise(line);
              return (
                <div key={i} className={cn(l.error && "text-status-recovery")}>
                  {l.prompt && (
                    <span className="text-code-key" aria-hidden="true">
                      ${" "}
                    </span>
                  )}
                  {l.text}
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    );
  },
);
Terminal.displayName = "Terminal";
