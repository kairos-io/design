import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn.ts";

export interface BreadcrumbItem {
  label: string;
  /** Where the crumb goes. The last item usually has none and is the current page. */
  href?: string;
  /**
   * A host's own link element (a router `<Link>`), rendered in place of the
   * plain anchor with the crumb's classes merged onto it. Give it the `href`
   * or `to` it needs; the label is its children.
   */
  element?: React.ReactElement;
}

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  /** The title in the mono face: a hostname, an image reference. */
  mono?: boolean;
  description?: React.ReactNode;
  /** A mono line over the title in place of a breadcrumb: "fleet / nodes". */
  eyebrow?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  /** A status badge shown next to the title. */
  status?: React.ReactNode;
  /** A line of facts under the title, such as an address or a version. */
  meta?: React.ReactNode;
  /** The page actions, in placement order: secondary, primary, then the overflow menu. */
  children?: React.ReactNode;
}

const linkClass = "truncate font-semibold text-link no-underline hover:text-accent hover:underline";

/**
 * The top of every page, as the console decks set it: an optional
 * breadcrumb or mono eyebrow, the 30px h1 with an optional status beside
 * it, a description or meta line in the sub ink, and the actions on the
 * right. Breadcrumb items are plain anchors unless the host passes its own
 * link `element`, which keeps the component free of any router.
 */
export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    { title, mono = false, description, eyebrow, breadcrumb, status, meta, children, className, ...props },
    ref,
  ) => (
    <div ref={ref} className={cn("mb-6", className)} {...props}>
      {eyebrow && !breadcrumb && <div className="mb-1 font-mono text-xs text-muted">{eyebrow}</div>}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-1.5">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            {breadcrumb.map((item, i) => (
              <li key={`${i}-${item.label}`} className="flex min-w-0 items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">/</span>}
                {item.element ? (
                  <Slot className={linkClass}>{item.element}</Slot>
                ) : item.href ? (
                  <a href={item.href} className={linkClass}>
                    {item.label}
                  </a>
                ) : (
                  <span className="truncate" aria-current={i === breadcrumb.length - 1 ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3.5">
            <h1
              className={cn(
                "m-0 min-w-0 break-words text-[30px] leading-tight text-ink",
                mono ? "font-mono font-medium tracking-[-0.02em]" : "font-semibold tracking-[-0.03em]",
              )}
            >
              {title}
            </h1>
            {status}
          </div>
          {description && <p className="mt-1.5 text-sm text-sub">{description}</p>}
          {meta && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-sm text-sub">
              {meta}
            </div>
          )}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  ),
);
PageHeader.displayName = "PageHeader";
