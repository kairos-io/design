import * as React from "react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "../../lib/cn.ts";
import { focusOutline } from "../../lib/focus.ts";
import { useMergedRef } from "../../hooks/useMergedRef.ts";

export interface InfoTooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The help text. Links and `<code>` inside it are styled. */
  children: React.ReactNode;
  /** The button's accessible name, which is also the panel's. Name the field: "About the base image". */
  label?: string;
  /** Start open, for documentation and screenshots. */
  defaultOpen?: boolean;
}

/**
 * A small info button next to a label that opens a surface panel with
 * help text. The panel stays open while the pointer moves from the button
 * into it, so links inside it are clickable; it also toggles on click for
 * keyboard and touch users, and closes on Escape or a click outside. The
 * panel is a disclosure (`aria-expanded` + `aria-controls`), not a tooltip,
 * because it holds interactive content.
 */
export const InfoTooltip = React.forwardRef<HTMLSpanElement, InfoTooltipProps>(
  ({ children, label = "More information", defaultOpen = false, className, ...props }, ref) => {
    const [open, setOpen] = useState(defaultOpen);
    const wrapperRef = useRef<HTMLSpanElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const arrowRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const panelId = useId();

    const setRefs = useMergedRef(wrapperRef, ref);

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

    // The panel opens from the button's left edge; near the viewport's right
    // edge it is shifted left so it stays 16px inside, and the arrow shifts
    // the other way to stay under the button. Measured on open, written to
    // the nodes directly: a layout correction, not state.
    useLayoutEffect(() => {
      const panel = panelRef.current;
      if (!open || !panel) return;
      const margin = 16;
      panel.style.left = "0px";
      const rect = panel.getBoundingClientRect();
      const width = document.documentElement.clientWidth;
      if (!width) return; // no layout to measure against (a DOM without one)
      let shift = 0;
      if (rect.right > width - margin) shift = width - margin - rect.right;
      if (rect.left + shift < margin) shift = margin - rect.left;
      panel.style.left = `${shift}px`;
      if (arrowRef.current) arrowRef.current.style.left = `${12 - shift}px`;
    }, [open]);

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
          className={cn(
            // No focus:outline-none here: in Tailwind v4 it would set the outline
            // style to none on keyboard focus too and hide the ring focusOutline draws.
            "ml-1 inline-flex rounded-sm align-middle text-muted hover:text-ink focus-visible:text-ink",
            focusOutline,
          )}
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
            ref={panelRef}
            id={panelId}
            role="group"
            aria-label={label}
            // Anchored to the button's left edge so it never runs off the
            // viewport when the label sits at the left margin; it grows
            // rightward into the form, never wider than the viewport less
            // its 16px gutters, and is shifted back inside when it would
            // cross the right edge.
            className="absolute bottom-full left-0 z-50 mb-2 w-max max-w-[min(24rem,calc(100vw-2rem))] -translate-x-2 rounded-base border-[1.5px] border-line bg-surface px-3 py-2.5 text-[13px] leading-relaxed text-ink"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="[&_a]:font-semibold [&_a]:text-link [&_a:hover]:text-accent [&_code]:rounded-sm [&_code]:bg-raised [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs">
              {children}
            </div>
            <div
              ref={arrowRef}
              className="absolute left-3 top-full -mt-px border-[5px] border-transparent border-t-line"
              aria-hidden="true"
            />
          </div>
        )}
      </span>
    );
  },
);
InfoTooltip.displayName = "InfoTooltip";
