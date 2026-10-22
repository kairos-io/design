import * as React from "react";
import { inputClasses } from "../Input/Input.tsx";
import { cn } from "../../lib/cn.ts";
import { useMergedRef } from "../../hooks/useMergedRef.ts";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Mono at 13px, for YAML, logs and anything an operator will copy. */
  mono?: boolean;
  /**
   * Numbers every line in a gutter beside the control, for a config file
   * (the installer's cloud-config). Implies `mono`. A line-numbered textarea
   * does not soft-wrap: a long line scrolls sideways, so each number sits
   * beside exactly one line of the value. The gutter is decorative: it is
   * hidden from assistive technology, not selectable and not part of the
   * value, so the control keeps its label, description and invalid state
   * as before.
   */
  lineNumbers?: boolean;
}

function countLines(value: unknown): number {
  return typeof value === "string" ? value.split("\n").length : 1;
}

/**
 * The multi-line text control, drawn like Input. Set `mono` for cloud
 * configs and logs, and `lineNumbers` for a file an operator edits by line.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, mono, lineNumbers, ...props }, ref) => {
    const inner = React.useRef<HTMLTextAreaElement | null>(null);
    const gutter = React.useRef<HTMLDivElement | null>(null);
    const setRefs = useMergedRef(inner, ref);
    const controlled = props.value !== undefined;
    // An uncontrolled textarea is the only place its value lives, so the line
    // count is read from the element on every input; a controlled one is
    // counted from the prop.
    const [typed, setTyped] = React.useState(() => countLines(props.defaultValue));
    const count = controlled ? countLines(props.value) : typed;
    const digits = Math.max(2, String(count).length);

    // The gutter is a sibling painted on the surface inside the control's left
    // padding, so a line scrolled sideways passes under it; it follows the
    // textarea's vertical scroll by translating its numbers, and is kept to
    // the control's client height so it never covers a horizontal scrollbar.
    const sync = React.useCallback(() => {
      const area = inner.current;
      const g = gutter.current;
      if (!area || !g) return;
      g.style.height = `${area.clientHeight}px`;
      const list = g.firstElementChild as HTMLElement | null;
      if (list) list.style.transform = `translateY(-${area.scrollTop}px)`;
    }, []);

    React.useEffect(() => {
      if (!lineNumbers) return;
      sync();
      const area = inner.current;
      if (!area || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(sync);
      observer.observe(area);
      return () => observer.disconnect();
    }, [lineNumbers, count, sync]);

    if (!lineNumbers) {
      return (
        <textarea
          className={cn(
            inputClasses,
            "min-h-[80px] leading-normal",
            mono && "font-mono text-[13px]",
            className,
          )}
          ref={setRefs}
          {...props}
        />
      );
    }

    const { onInput, onScroll, style, ...rest } = props;

    return (
      <div
        className="relative grid w-full"
        style={{ "--gutter": `calc(${digits}ch + 20px)` } as React.CSSProperties}
      >
        <textarea
          className={cn(
            inputClasses,
            "peer min-h-[80px] overflow-x-auto whitespace-pre font-mono text-[13px] leading-normal",
            className,
          )}
          wrap="off"
          ref={setRefs}
          style={{ paddingLeft: "calc(var(--gutter) + 10px)", ...style }}
          onInput={(e) => {
            if (!controlled) setTyped(countLines(e.currentTarget.value));
            onInput?.(e);
          }}
          onScroll={(e) => {
            sync();
            onScroll?.(e);
          }}
          {...rest}
        />
        <div
          ref={gutter}
          aria-hidden="true"
          data-gutter=""
          className="pointer-events-none absolute left-px top-px w-[var(--gutter)] select-none overflow-hidden whitespace-nowrap border-r border-line bg-surface py-2.5 pr-2 text-right font-mono text-[13px] leading-normal text-muted peer-disabled:bg-raised"
        >
          <div>
            {Array.from({ length: count }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
