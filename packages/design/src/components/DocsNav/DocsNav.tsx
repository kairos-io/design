import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { Tile } from "../Tiles/Tile.tsx";
import { focusRing } from "../../lib/focus.ts";

export interface DocsNavItem {
  label: React.ReactNode;
  href: string;
  /** The page the reader is on: on a surface, with the accent tile beside it. */
  current?: boolean;
}

export interface DocsNavGroup {
  title: React.ReactNode;
  items: DocsNavItem[];
}

export interface DocsNavProps extends React.HTMLAttributes<HTMLElement> {
  groups: DocsNavGroup[];
  /** Called with the item's href when a link is activated, for a host without full page loads. */
  onNavigate?: (href: string) => void;
  /** Accessible name of the navigation landmark. */
  label?: string;
}

/**
 * The docs sidebar: groups with a mono title, the current page on a surface
 * with the accent tile, the rest indented in the sub ink. Sits on the side
 * surface with a hairline on its right.
 */
export const DocsNav = React.forwardRef<HTMLElement, DocsNavProps>(
  ({ groups, onNavigate, label = "Docs", className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label={label}
      className={cn("flex w-64 flex-none flex-col gap-5 border-r border-line bg-side px-3.5 py-6", className)}
      {...props}
    >
      {groups.map((g, gi) => (
        <div key={gi} className="flex flex-col gap-px">
          <span className="px-2.5 pb-2 font-mono text-xs text-muted">{g.title}</span>
          <ul className="m-0 list-none p-0">
            {g.items.map((it) => (
              <li key={it.href}>
                <a
                  href={it.href}
                  aria-current={it.current ? "page" : undefined}
                  onClick={
                    onNavigate
                      ? (e) => {
                          e.preventDefault();
                          onNavigate(it.href);
                        }
                      : undefined
                  }
                  className={cn(
                    `flex items-center gap-2 rounded-base py-[7px] text-[15px] no-underline transition-colors ${focusRing}`,
                    it.current
                      ? "bg-surface px-2.5 font-bold text-ink"
                      : "pr-2.5 pl-[30px] text-sub hover:text-ink",
                  )}
                >
                  {it.current && <Tile tone={2} size={12} />}
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  ),
);
DocsNav.displayName = "DocsNav";

export interface DocsTocProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** The headings on the page, in order. */
  items: { label: React.ReactNode; href: string; current?: boolean }[];
  /** A link under the list: "Edit this page". */
  action?: React.ReactNode;
  title?: React.ReactNode;
}

/** The "On this page" column of a docs page. */
export const DocsToc = React.forwardRef<HTMLElement, DocsTocProps>(
  ({ items, action, title = "On this page", className, ...props }, ref) => (
    <aside
      ref={ref}
      aria-label={typeof title === "string" ? title : "On this page"}
      className={cn("flex w-[220px] flex-none flex-col gap-2.5 px-5 py-10 text-sm", className)}
      {...props}
    >
      <span className="pb-1 font-mono text-xs text-muted">{title}</span>
      {items.map((it) => (
        <a
          key={it.href}
          href={it.href}
          aria-current={it.current ? "location" : undefined}
          className={cn(
            `no-underline hover:text-ink ${focusRing}`,
            it.current ? "font-bold text-ink" : "text-muted",
          )}
        >
          {it.label}
        </a>
      ))}
      {action && <span className="mt-4 text-sm font-bold [&_a]:text-link [&_a]:no-underline">{action}</span>}
    </aside>
  ),
);
DocsToc.displayName = "DocsToc";
