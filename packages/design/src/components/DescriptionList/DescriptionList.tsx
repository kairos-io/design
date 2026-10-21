import * as React from "react";
import { cn } from "../../lib/cn.ts";

export interface DescriptionItem {
  term: React.ReactNode;
  value: React.ReactNode;
  /** The value in the mono face: an id, an address, a version. */
  mono?: boolean;
}

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: DescriptionItem[];
  /** The term column's width. */
  termWidth?: string | number;
}

/** Facts in two columns with a hairline between rows: the Details panel of the node detail deck. */
export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ items, termWidth = 96, className, ...props }, ref) => (
    <dl ref={ref} className={cn("m-0 grid", className)} {...props}>
      {items.map((item, i) => (
        <div
          key={i}
          className="grid gap-2 border-t border-line py-[7px] text-sm"
          style={{
            gridTemplateColumns: `${typeof termWidth === "number" ? `${termWidth}px` : termWidth} minmax(0, 1fr)`,
          }}
        >
          <dt className="text-muted">{item.term}</dt>
          <dd className={cn("m-0 min-w-0 wrap-anywhere", item.mono && "font-mono text-xs")}>{item.value}</dd>
        </div>
      ))}
    </dl>
  ),
);
DescriptionList.displayName = "DescriptionList";
