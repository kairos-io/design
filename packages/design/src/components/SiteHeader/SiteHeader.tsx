import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { focusRingOffset } from "../../lib/focus.ts";

export interface SiteLink {
  label: React.ReactNode;
  href: string;
  /** The page the visitor is on: underlined in the accent, like the docs navbar. */
  current?: boolean;
}

export interface SiteHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** The logo, linked to the home page: `<a href="/"><KairosLogo /></a>`. */
  logo: React.ReactNode;
  /** The primary navigation. */
  links?: SiteLink[];
  /** Controls at the end: a GitHub chip, a Quick start button, a search field. */
  actions?: React.ReactNode;
  /** A hairline under the header, as the docs site has. */
  bordered?: boolean;
  /** Accessible name of the navigation landmark. */
  navLabel?: string;
}

/**
 * The site header of kairos.io, hadron-linux.io and the docs: the logo, the
 * primary links and the actions, on one row that wraps on narrow screens.
 * Links take `href`; the host passes its own router link through `logo` and
 * `actions` if it needs one.
 */
export const SiteHeader = React.forwardRef<HTMLElement, SiteHeaderProps>(
  ({ logo, links = [], actions, bordered = false, navLabel = "Primary", className, ...props }, ref) => (
    <header ref={ref} className={cn("w-full", bordered && "border-b border-line", className)} {...props}>
      <div className="mx-auto flex w-full max-w-(--page-max) flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          <div className="flex shrink-0 items-center">{logo}</div>
          {links.length > 0 && (
            <nav aria-label={navLabel}>
              <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-base font-semibold">
                {links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      aria-current={l.current ? "page" : undefined}
                      className={cn(
                        `inline-block rounded-sm py-1 text-ink no-underline transition-colors hover:text-link ${focusRingOffset}`,
                        l.current && "shadow-[inset_0_-2px_0_var(--accent-line)]",
                      )}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  ),
);
SiteHeader.displayName = "SiteHeader";
