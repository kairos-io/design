import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight } from "lucide-react";
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
  description?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  /** A status badge shown next to the title. */
  status?: React.ReactNode;
  /** A line of facts under the title, such as an address or a version. */
  meta?: React.ReactNode;
  /** The page actions, in placement order: secondary, primary, then the overflow menu. */
  children?: React.ReactNode;
}

const linkClass = "truncate hover:text-ink hover:underline";

/**
 * The top of every page: an optional breadcrumb, the h1 with an optional
 * status badge, a description or meta line, and the actions on the right.
 * Breadcrumb items are plain anchors unless the host passes its own link
 * `element`, which keeps the component free of any router.
 */
export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, breadcrumb, status, meta, children, className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-8", className)} {...props}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
            {breadcrumb.map((item, i) => (
              <li key={`${i}-${item.label}`} className="flex min-w-0 items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="min-w-0 break-words text-3xl font-bold tracking-tight">{title}</h1>
            {status}
          </div>
          {description && <p className="mt-1 text-muted">{description}</p>}
          {meta && (
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">{meta}</div>
          )}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  ),
);
PageHeader.displayName = "PageHeader";
