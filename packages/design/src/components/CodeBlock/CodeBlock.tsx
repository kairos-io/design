import * as React from "react";
import { Check, Copy } from "lucide-react";
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

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The code, as text. Never rendered as HTML. */
  code: string;
  /** The bar's title: a file name, or "terminal". */
  title?: React.ReactNode;
  /** Show the copy control in the bar. */
  copyable?: boolean;
  /** Prefix every line with the prompt, as a terminal sample does. */
  prompt?: string;
}

/**
 * A code sample: a dark panel in both themes with a title bar, as the docs
 * product page and the Foundations deck draw it. The `$` prompt, when given,
 * is painted in the code key colour and is not part of what gets copied.
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ code, title = "terminal", copyable = true, prompt, className, ...props }, ref) => {
    const { copied, copy } = useCopy(code);
    const lines = code.split("\n");
    return (
      <div ref={ref} className={cn("overflow-hidden rounded-base bg-code", className)} {...props}>
        <div className="flex items-center justify-between gap-3 bg-code-bar px-4 py-2 font-mono text-xs text-code-muted">
          <span>{title}</span>
          {copyable && (
            <button
              type="button"
              onClick={copy}
              aria-live="polite"
              className="inline-flex items-center gap-1.5 rounded-sm text-code-muted hover:text-code-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-code-ink"
            >
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              {copied ? "copied" : "copy"}
            </button>
          )}
        </div>
        <pre className="m-0 overflow-x-auto px-4 py-4 font-mono text-[13px] leading-[1.85] text-code-ink whitespace-pre-wrap">
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              {prompt && (
                <span className="text-code-key" aria-hidden="true">
                  {prompt}{" "}
                </span>
              )}
              {line}
              {i < lines.length - 1 ? "\n" : null}
            </React.Fragment>
          ))}
        </pre>
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

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
