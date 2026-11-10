import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { focusRing } from "../../lib/focus.ts";

// The node table of the console decks: a surface with 4px corners, the
// header row on the head tone in 13px bold muted, 15px rows parted by
// hairlines, the hover tone on hover, and the selected row with an inset
// accent bar on its left.

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => {
    // A region that scrolls must be reachable by keyboard, or the rows past
    // its edge cannot be read without a mouse. A tab stop on every table
    // would be noise, so the wrapper takes one only while the table is
    // actually wider than it is, which is the narrow viewport case.
    const scroller = React.useRef<HTMLDivElement | null>(null);
    const [scrollable, setScrollable] = React.useState(false);
    React.useEffect(() => {
      const box = scroller.current;
      if (!box) return;
      const measure = () => setScrollable(box.scrollWidth > box.clientWidth);
      measure();
      if (typeof ResizeObserver !== "function") return;
      const observer = new ResizeObserver(measure);
      observer.observe(box);
      if (box.firstElementChild) observer.observe(box.firstElementChild);
      return () => observer.disconnect();
    }, []);
    return (
      <div
        ref={scroller}
        tabIndex={scrollable ? 0 : undefined}
        className={cn(
          "relative w-full overflow-auto rounded-base bg-surface",
          scrollable && `${focusRing} focus-visible:ring-inset`,
        )}
      >
        <table ref={ref} className={cn("w-full caption-bottom text-[15px]", className)} {...props} />
      </div>
    );
  },
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-head [&_tr]:border-0 [&_tr]:hover:bg-head", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr]:border-t", className)} {...props} />
));
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn("border-t bg-head font-semibold", className)} {...props} />
));
TableFooter.displayName = "TableFooter";

// The selected row's accent bar and the focus ring are both box shadows on
// the row, so each is set through its Tailwind layer (inset-shadow, ring) and
// the two compose instead of the later one replacing the other. The ring is
// inset: a row has no room outside itself in a table, and a focusable row (a
// host that selects nodes from the keyboard) keeps the deck's hairlines.
export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        `border-line transition-colors hover:bg-hover data-[state=selected]:bg-hover data-[state=selected]:inset-shadow-[3px_0_0_var(--accent)] ${focusRing} focus-visible:ring-inset`,
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-10 px-4 text-left align-middle text-[13px] font-bold text-muted [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "px-4 py-[11px] align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("px-4 py-3 text-left font-mono text-xs text-muted", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";
