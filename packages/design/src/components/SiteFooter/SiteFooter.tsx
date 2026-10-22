import * as React from "react";
import { cn } from "../../lib/cn.ts";

export interface SiteFooterColumn {
  title: React.ReactNode;
  items: { label: React.ReactNode; href: string }[];
}

export interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {
  /** The logo and the one-line description under it. */
  brand: React.ReactNode;
  /** Link columns: Products, Docs, Community. */
  columns?: SiteFooterColumn[];
  /** The bottom row: copyright on the left, a note on the right. */
  legal?: React.ReactNode;
  note?: React.ReactNode;
  /** One row instead of columns: the hadron-linux.io footer. */
  compact?: boolean;
}

/**
 * The site footer. Always the dark canvas, in both page themes, so it nests
 * `data-theme="dark"` and the tokens inside it are the dark ones.
 */
export const SiteFooter = React.forwardRef<HTMLElement, SiteFooterProps>(
  ({ brand, columns = [], legal, note, compact = false, className, children, ...props }, ref) => (
    <footer ref={ref} data-theme="dark" className={cn("w-full bg-bg text-sub", className)} {...props}>
      <div
        className={cn(
          "mx-auto flex w-full max-w-(--page-max) flex-col px-4 sm:px-8",
          compact ? "gap-6 py-10" : "gap-10 pt-14 pb-8",
        )}
      >
        {compact ? (
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-5 text-sm">{brand}</div>
            {children}
          </div>
        ) : (
          <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
            {/* items-start, or the stretched cross axis widens the logo's box and the lockup drifts to the centre of the cell. */}
            <div className="flex flex-col items-start gap-3.5 text-sm leading-normal">{brand}</div>
            {columns.map((c, i) => (
              <div key={i} className="flex flex-col gap-2.5 text-[15px]">
                <span className="font-bold text-ink">{c.title}</span>
                {c.items.map((it) => (
                  <a
                    key={it.href}
                    href={it.href}
                    className="text-sub no-underline hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    {it.label}
                  </a>
                ))}
              </div>
            ))}
            {children}
          </div>
        )}
        {(legal || note) && (
          <div className="flex flex-wrap justify-between gap-4 border-t border-line pt-5 text-[13px] text-muted">
            <span>{legal}</span>
            <span>{note}</span>
          </div>
        )}
      </div>
    </footer>
  ),
);
SiteFooter.displayName = "SiteFooter";
