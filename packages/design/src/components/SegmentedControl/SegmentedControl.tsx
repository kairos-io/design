import * as React from "react";
import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "../../lib/cn.ts";
import { focusOutline } from "../../lib/focus.ts";
import { ReserveWidth } from "../ReserveWidth/ReserveWidth.tsx";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** A short mono code over the label: the docs' "L1", "L2", "L3". */
  code?: string;
  /** A line under the label, read as the option's description. */
  hint?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "role"
> {
  value: T;
  onChange(v: T): void;
  options: SegmentedOption<T>[];
  /** Required: the group's name ("Architecture"), as the radio group has no visible legend. */
  "aria-label": string;
  /** Every option the same width, as the docs' level picker. Off, each option takes its own width. */
  fill?: boolean;
}

function SegmentedControlInner<T extends string>(
  { value, onChange, options, className, fill = true, ...props }: SegmentedControlProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, dir: 1 | -1) => {
    const n = options.length;
    for (let step = 1; step <= n; step++) {
      const i = (from + dir * step + n) % n;
      if (!options[i].disabled) {
        onChange(options[i].value);
        refs.current[i]?.focus();
        return;
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(index, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(index, -1);
    }
  };

  const hasSelected = options.some((o) => o.value === value && !o.disabled);

  return (
    <div
      ref={ref}
      role="radiogroup"
      className={cn(
        "gap-1 rounded-base bg-raised p-1",
        fill ? "grid auto-cols-fr grid-flow-col" : "inline-flex flex-wrap",
        className,
      )}
      {...props}
    >
      {options.map((o, i) => {
        const selected = o.value === value;
        const focusable = selected || (!hasSelected && i === 0);
        const hintId = o.hint ? `${id}-${i}-hint` : undefined;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={o.label}
            aria-describedby={hintId}
            disabled={o.disabled}
            tabIndex={focusable ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "flex flex-col items-start rounded-[3px] px-2.5 py-2 text-left transition-colors",
              focusOutline,
              "disabled:cursor-not-allowed disabled:opacity-50",
              selected ? "bg-surface text-ink" : "text-muted hover:text-ink",
            )}
          >
            {o.code && (
              <span className={cn("font-mono text-xs leading-4", selected ? "text-link" : "text-muted")}>
                {o.code}
              </span>
            )}
            {/* The chosen label is bold and bold glyphs are wider, so the option is
                held at the width of its bold label and nothing shifts when the
                choice moves. */}
            <ReserveWidth
              className="text-[15px] leading-tight"
              childClassName={selected ? "font-bold" : "font-semibold"}
              twinClassName="font-bold"
              twin={o.label}
            >
              {o.label}
            </ReserveWidth>
            {o.hint && (
              <span id={hintId} className="mt-0.5 text-[13px] leading-snug text-muted">
                {o.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A compact single choice (a radio group) for a few short options: the
 * docs' level picker (L1 Guided, L2 Automate, L3 Extend) and the console's
 * architecture and output pickers. A raised track with the chosen option
 * lifted to the surface, as the Foundations deck draws it. Arrow keys move
 * the selection and skip disabled options; only the selected option is in
 * the tab order.
 */
export const SegmentedControl = React.forwardRef(SegmentedControlInner) as <T extends string>(
  props: SegmentedControlProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
(SegmentedControl as unknown as { displayName: string }).displayName = "SegmentedControl";
