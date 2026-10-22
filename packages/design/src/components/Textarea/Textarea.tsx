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
   * as before; the border, radius and focus ring move to a wrapper around
   * the gutter and the control, and `className` still goes to the textarea.
   * While the control has focus, the line holding the caret (or every line
   * a selection spans) shows its number in ink on a faint band across the
   * row, as a code editor does.
   */
  lineNumbers?: boolean;
  /**
   * With `lineNumbers`: line numbers (as shown, from 1) to mark in the
   * danger tone, number and band, for a validator's errors.
   */
  highlight?: number[];
}

/** 13px at `leading-normal`, used until the control's own line height can be read. */
const FALLBACK_LINE_HEIGHT = 19.5;
const PADDING_Y = 10;

function countLines(value: unknown): number {
  return typeof value === "string" ? value.split("\n").length : 1;
}

function lineAt(value: string, offset: number): number {
  let line = 0;
  for (let i = 0; i < offset && i < value.length; i++) if (value.charCodeAt(i) === 10) line++;
  return line;
}

function measuredLineHeight(area: HTMLTextAreaElement): number {
  const lh = parseFloat(getComputedStyle(area).lineHeight);
  return Number.isFinite(lh) && lh > 0 ? lh : FALLBACK_LINE_HEIGHT;
}

const raf: (cb: () => void) => number =
  typeof requestAnimationFrame === "function"
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => window.setTimeout(cb, 0);
const cancelRaf: (id: number) => void =
  typeof cancelAnimationFrame === "function"
    ? (id) => cancelAnimationFrame(id)
    : (id) => window.clearTimeout(id);

/**
 * The multi-line text control, drawn like Input. Set `mono` for cloud
 * configs and logs, and `lineNumbers` for a file an operator edits by line.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, mono, lineNumbers, highlight, ...props }, ref) => {
    const inner = React.useRef<HTMLTextAreaElement | null>(null);
    const gutter = React.useRef<HTMLDivElement | null>(null);
    const bands = React.useRef<HTMLDivElement | null>(null);
    const frame = React.useRef(0);
    const setRefs = useMergedRef(inner, ref);
    const controlled = props.value !== undefined;
    // An uncontrolled textarea is the only place its value lives, so the line
    // count is read from the element on every input; a controlled one is
    // counted from the prop.
    const [typed, setTyped] = React.useState(() => countLines(props.defaultValue));
    const count = controlled ? countLines(props.value) : typed;
    const digits = Math.max(2, String(count).length);
    const [lineHeight, setLineHeight] = React.useState(FALLBACK_LINE_HEIGHT);
    // The caret's line, or the first and last line of a selection, 0-based;
    // null while the control is not focused.
    const [caret, setCaret] = React.useState<[number, number] | null>(null);

    // The gutter and the bands are siblings of the control that follow its
    // scroll by translating their contents; both are kept to the control's
    // client height so they stop above a horizontal scrollbar, and the
    // number list reaches the control's scroll height so the two never run
    // out of step at the bottom. The list takes the control's own line
    // height in pixels, since a textarea and a div can resolve the same
    // `line-height` keyword differently.
    const follow = React.useCallback(() => {
      const area = inner.current;
      if (!area) return;
      const shift = `translateY(-${area.scrollTop}px)`;
      const list = gutter.current?.firstElementChild as HTMLElement | null | undefined;
      if (list) list.style.transform = shift;
      const layer = bands.current?.firstElementChild as HTMLElement | null | undefined;
      if (layer) layer.style.transform = shift;
    }, []);

    const measure = React.useCallback(() => {
      const area = inner.current;
      const g = gutter.current;
      if (!area || !g) return;
      const lh = measuredLineHeight(area);
      setLineHeight((prev) => (prev === lh ? prev : lh));
      g.style.height = `${area.clientHeight}px`;
      if (bands.current) bands.current.style.height = `${area.clientHeight}px`;
      const list = g.firstElementChild as HTMLElement | null;
      if (list) {
        list.style.lineHeight = `${lh}px`;
        list.style.minHeight = `${Math.max(0, area.scrollHeight - 2 * PADDING_Y)}px`;
      }
      follow();
    }, [follow]);

    // The caret is read on the next frame, after the browser has moved it,
    // from whichever event announced the move: select, selectionchange,
    // keys, clicks, input and scroll.
    const readCaret = React.useCallback(() => {
      cancelRaf(frame.current);
      frame.current = raf(() => {
        const area = inner.current;
        if (!area || document.activeElement !== area) return;
        const value = area.value;
        const from = lineAt(value, area.selectionStart);
        const to = area.selectionEnd === area.selectionStart ? from : lineAt(value, area.selectionEnd);
        setCaret((prev) => (prev && prev[0] === from && prev[1] === to ? prev : [from, to]));
      });
    }, []);

    React.useEffect(() => {
      if (!lineNumbers) return;
      measure();
      const area = inner.current;
      if (!area || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measure);
      observer.observe(area);
      return () => observer.disconnect();
    }, [lineNumbers, count, measure]);

    React.useEffect(() => () => cancelRaf(frame.current), []);

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

    const { onInput, onScroll, onSelect, onKeyUp, onClick, onFocus, onBlur, style, ...rest } = props;
    const marked = highlight && highlight.length > 0 ? new Set(highlight) : undefined;
    const isCurrent = (n: number) => caret !== null && n - 1 >= caret[0] && n - 1 <= caret[1];

    return (
      <div
        data-numbered=""
        className="relative grid w-full grid-cols-[var(--gutter)_minmax(0,1fr)] overflow-hidden rounded-base border-[1.5px] border-line bg-surface font-mono text-[13px] leading-normal text-ink transition-colors focus-within:border-ink has-[[aria-invalid=true]]:border-status-recovery has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-raised has-[:disabled]:text-muted"
        style={{ "--gutter": `calc(${digits}ch + 21px)` } as React.CSSProperties}
      >
        {/* The bands sit under the gutter and the control (both are positioned
            and later in the DOM), so they paint behind the text and never
            touch the value or the accessibility tree. */}
        <div
          ref={bands}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
        >
          <div className="relative">
            {marked &&
              Array.from(marked)
                .filter((n) => n >= 1 && n <= count)
                .map((n) => (
                  <div
                    key={`h${n}`}
                    data-band="highlight"
                    className="absolute inset-x-0 bg-status-recovery/10"
                    style={{ top: PADDING_Y + (n - 1) * lineHeight, height: lineHeight }}
                  />
                ))}
            {caret && (
              <div
                data-band="current"
                className="absolute inset-x-0 bg-raised/60"
                style={{
                  top: PADDING_Y + caret[0] * lineHeight,
                  height: (caret[1] - caret[0] + 1) * lineHeight,
                }}
              />
            )}
          </div>
        </div>
        <div className="relative overflow-hidden border-r border-line">
          <div
            ref={gutter}
            aria-hidden="true"
            data-gutter=""
            className="pointer-events-none absolute inset-x-0 top-0 select-none overflow-hidden whitespace-nowrap px-2.5 py-2.5 text-right text-muted"
          >
            <div>
              {Array.from({ length: count }, (_, i) => {
                const n = i + 1;
                return (
                  <div
                    key={i}
                    data-current={isCurrent(n) ? "" : undefined}
                    data-highlight={marked?.has(n) ? "" : undefined}
                    className={cn(isCurrent(n) && "text-ink", marked?.has(n) && "text-status-recovery")}
                  >
                    {n}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <textarea
          className={cn(
            inputClasses,
            "relative min-h-[80px] rounded-none border-0 bg-transparent pl-2.5 font-mono text-[13px] leading-normal overflow-x-auto whitespace-pre disabled:bg-transparent",
            className,
          )}
          wrap="off"
          ref={setRefs}
          style={style}
          onInput={(e) => {
            if (!controlled) setTyped(countLines(e.currentTarget.value));
            measure();
            readCaret();
            onInput?.(e);
          }}
          onScroll={(e) => {
            follow();
            readCaret();
            onScroll?.(e);
          }}
          onSelect={(e) => {
            readCaret();
            onSelect?.(e);
          }}
          onKeyUp={(e) => {
            readCaret();
            onKeyUp?.(e);
          }}
          onClick={(e) => {
            readCaret();
            onClick?.(e);
          }}
          onFocus={(e) => {
            document.addEventListener("selectionchange", readCaret);
            readCaret();
            onFocus?.(e);
          }}
          onBlur={(e) => {
            document.removeEventListener("selectionchange", readCaret);
            cancelRaf(frame.current);
            setCaret(null);
            onBlur?.(e);
          }}
          {...rest}
        />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
