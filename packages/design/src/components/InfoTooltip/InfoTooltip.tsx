import * as React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "../../lib/cn.ts";

export interface InfoTooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The help text. Links and `<code>` inside it are styled. */
  children: React.ReactNode;
  /** The button's accessible name, which is also the panel's. Name the field: "About the base image". */
  label?: string;
  /** Start open, for documentation and screenshots. */
  defaultOpen?: boolean;
}

/**
 * A small info button next to a label that opens a high-contrast panel with
 * help text. The panel stays open while the pointer moves from the button
 * into it, so links inside it are clickable; it also toggles on click for
 * keyboard and touch users, and closes on Escape or a click outside. The
 * panel is a disclosure (`aria-expanded` + `aria-controls`), not a tooltip,
 * because it holds interactive content. AuroraBoot's components/InfoTooltip.tsx.
 */
export const InfoTooltip = React.forwardRef<HTMLSpanElement, InfoTooltipProps>(
  ({ children, label = "More information", defaultOpen = false, className, ...props }, ref) => {
    const [open, setOpen] = useState(defaultOpen);
    const wrapperRef = useRef<HTMLSpanElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const panelId = useId();

    const setRefs = useCallback(
      (el: HTMLSpanElement | null) => {
        wrapperRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [ref],
    );

    const cancelClose = useCallback(() => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    }, []);

    // A 150 ms grace period lets the pointer cross the gap between the button
    // and the panel without the panel vanishing mid-move.
    const scheduleClose = useCallback(() => {
      cancelClose();
      closeTimer.current = setTimeout(() => setOpen(false), 150);
    }, [cancelClose]);

    useEffect(() => {
      if (!open) return;
      function handleClick(e: MouseEvent) {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    useEffect(() => () => cancelClose(), [cancelClose]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Escape" && open) {
        e.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    return (
      <span
        ref={setRefs}
        className={cn("relative inline-flex", className)}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        onKeyDown={onKeyDown}
        {...props}
      >
        <button
          ref={buttonRef}
          type="button"
          className="ml-1 inline-flex rounded-sm align-middle text-muted hover:text-ink focus:outline-none focus-visible:text-ink focus-visible:ring-2 focus-visible:ring-ink"
          aria-label={label}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          onMouseEnter={() => {
            cancelClose();
            setOpen(true);
          }}
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        {open && (
          <div
            id={panelId}
            role="group"
            aria-label={label}
            // Anchored to the button's left edge so it never runs off the
            // viewport when the label sits at the left margin; it grows
            // rightward into the form.
            className="absolute bottom-full left-0 z-50 mb-2 w-max max-w-sm -translate-x-2 rounded-base border bg-surface px-3 py-2.5 text-xs leading-relaxed text-ink"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-accent-soft [&_code]:rounded-base [&_code]:bg-inner [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[11px]">
              {children}
            </div>
            <div
              className="absolute left-3 top-full -mt-px border-4 border-transparent border-t-surface"
              aria-hidden="true"
            />
          </div>
        )}
      </span>
    );
  },
);
InfoTooltip.displayName = "InfoTooltip";
