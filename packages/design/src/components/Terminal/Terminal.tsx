import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../../lib/cn.ts";
import { copyText } from "../../lib/clipboard.ts";
import { useMergedRef } from "../../hooks/useMergedRef.ts";
import { useTransient } from "../../hooks/useTransient.ts";
import { ReserveWidth } from "../ReserveWidth/ReserveWidth.tsx";

export interface TerminalLine {
  text: string;
  /** Rendered in the recovery red. */
  error?: boolean;
  /** A command the reader could type: the line starts with a "$" prompt in the key colour. */
  prompt?: boolean;
}

export interface TerminalProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "title" | "onCopy"
> {
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
  /**
   * Numbers every line in a right-aligned gutter, as the installer's YAML
   * editor does. The numbers are decorative: hidden from assistive
   * technology and not selectable, so neither the copy action nor a manual
   * selection picks them up.
   */
  lineNumbers?: boolean;
  /** The number of the first line, for a snippet that starts mid-file. 1 by default. */
  firstLine?: number;
  /** Line numbers (as shown, so counted from `firstLine`) to mark: the row sits on the bar colour and its number turns to the key colour. */
  highlight?: number[];
}

function normalise(line: string | TerminalLine): TerminalLine {
  return typeof line === "string" ? { text: line } : line;
}

/**
 * The code block and log panel of the Foundations deck: the dark code
 * ground in both themes, a bar with the title and a copy action, Martian
 * Mono at 13px with a loose line height, the "$" prompt in the key colour.
 * Streamed logs scroll to the newest line. Text only: the output is never
 * rendered as HTML. `lineNumbers` adds the installer editor's gutter, with
 * `firstLine` for a snippet from mid-file and `highlight` to mark rows.
 */
export const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  (
    {
      lines,
      autoscroll = true,
      maxHeight = "70vh",
      title = "terminal",
      copy = false,
      onCopy,
      lineNumbers = false,
      firstLine = 1,
      highlight,
      className,
      ...props
    },
    ref,
  ) => {
    const inner = React.useRef<HTMLDivElement | null>(null);
    const setRefs = useMergedRef(inner, ref);
    const [copied, setCopied] = useTransient(false);

    React.useEffect(() => {
      if (autoscroll && inner.current) {
        inner.current.scrollTop = inner.current.scrollHeight;
      }
    }, [lines, autoscroll]);

    // "copied" is only shown once the text is on the clipboard: a plain http
    // page has no Clipboard API, and copyText falls back to the legacy path
    // there, so the label never claims a copy that did not happen.
    const handleCopy = async () => {
      const text = lines.map((l) => normalise(l).text).join("\n");
      if (onCopy) {
        onCopy(text);
        setCopied(true);
      } else if (await copyText(text)) {
        setCopied(true);
      }
    };

    const { "aria-label": label, ...rest } = props;

    // The gutter is as wide as the largest number, never narrower than two
    // digits, so a streamed log does not shift its text at the tenth line.
    const digits = Math.max(2, String(firstLine + Math.max(lines.length, 1) - 1).length);
    const marked = highlight && highlight.length > 0 ? new Set(highlight) : undefined;

    return (
      <div className={cn("overflow-hidden rounded-base bg-code text-code-ink", className)} {...rest}>
        {title !== null && (
          <div className="flex items-center justify-between gap-3 bg-code-bar px-3.5 py-2 font-mono text-xs leading-4 text-code-muted">
            <span>{title}</span>
            {copy && (
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  "-mx-1.5 -my-0.5 rounded-sm px-1.5 py-0.5 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-code-ink",
                  copied ? "bg-status-healthy text-status-ink" : "text-code-muted hover:text-code-ink",
                )}
              >
                {/* The chip is held at the width of its "copied" state so it does
                    not jump left and back when the label changes. Once copied it
                    takes the filled success look (healthy green, status ink), the
                    one green pairing that reads on the code bar in both themes: the
                    ok tone as text reaches only 2.8:1 there. The padding is always
                    present and pulled back with negative margins, so the fill
                    appears without moving anything. */}
                <ReserveWidth
                  childClassName="inline-flex items-center gap-1.5"
                  twinClassName="inline-flex items-center gap-1.5"
                  twin={
                    <>
                      <Check className="h-3 w-3" aria-hidden="true" />
                      copied
                    </>
                  }
                >
                  {copied ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3 w-3" aria-hidden="true" />
                  )}
                  {copied ? "copied" : "copy"}
                </ReserveWidth>
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
          <pre
            className="m-0 whitespace-pre-wrap font-[inherit] text-[inherit] wrap-anywhere"
            style={
              lineNumbers ? ({ "--gutter": `calc(${digits}ch + 12px)` } as React.CSSProperties) : undefined
            }
          >
            {lines.map((line, i) => {
              const l = normalise(line);
              const n = firstLine + i;
              const hit = lineNumbers && marked?.has(n);
              const content = (
                <>
                  {l.prompt && (
                    <span className="text-code-key" aria-hidden="true">
                      ${" "}
                    </span>
                  )}
                  {l.text}
                </>
              );
              // Each row is its own grid so a wrapped line keeps its number
              // beside its first visual line; the highlight runs under the
              // body's padding so it reads as a full row.
              return (
                <div
                  key={i}
                  data-line={lineNumbers ? n : undefined}
                  className={cn(
                    l.error && "text-status-recovery",
                    lineNumbers && "grid grid-cols-[var(--gutter)_minmax(0,1fr)] gap-x-2.5",
                    hit && "-mx-3.5 bg-code-bar px-3.5",
                  )}
                >
                  {lineNumbers && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "select-none whitespace-nowrap border-r border-code-muted/30 pr-2.5 text-right text-code-muted",
                        hit && "text-code-key",
                      )}
                    >
                      {n}
                    </span>
                  )}
                  {lineNumbers ? <span>{content}</span> : content}
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
