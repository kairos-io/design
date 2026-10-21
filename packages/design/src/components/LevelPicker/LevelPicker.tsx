import * as React from "react";
import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "../../lib/cn.ts";

export interface LevelOption<T extends string> {
  value: T;
  /** The short mono key: L1, L2, L3. */
  key: React.ReactNode;
  /** The name: Guided, Automate, Extend. */
  label: React.ReactNode;
  /** Who it is for: "First touch, PoC". */
  hint?: React.ReactNode;
}

export interface LevelPickerProps<T extends string> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "role"
> {
  value: T;
  onChange(v: T): void;
  options: LevelOption<T>[];
  /** Required: the group's name ("Docs level"), as it has no visible legend. */
  "aria-label": string;
}

function LevelPickerInner<T extends string>(
  { value, onChange, options, className, ...props }: LevelPickerProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (from: number, dir: 1 | -1) => {
    const n = options.length;
    const i = (from + dir + n) % n;
    onChange(options[i].value);
    refs.current[i]?.focus();
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
  return (
    <div
      ref={ref}
      role="radiogroup"
      className={cn("grid gap-1 rounded-base bg-raised p-1", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      {...props}
    >
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${id}-${o.value}`}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-[3px] px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
              selected ? "bg-surface text-ink" : "text-muted hover:text-ink",
            )}
          >
            <span className={cn("font-mono text-xs", selected && "text-link")}>{o.key}</span>
            <span className={cn("text-[17px]", selected ? "font-bold" : "font-semibold")}>{o.label}</span>
            {o.hint && <span className={cn("text-[13px]", selected && "text-muted")}>{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The L1 / L2 / L3 track: a radio group on the raised surface where the
 * chosen level sits on a surface with its key in the link colour. From the
 * Foundations deck and the docs product page.
 */
export const LevelPicker = React.forwardRef(LevelPickerInner) as <T extends string>(
  props: LevelPickerProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement;
