import * as React from "react";
import { cn } from "../../lib/cn.ts";

export interface AnnouncementBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A mono tag at the start: a version. */
  tag?: React.ReactNode;
  /** The one sentence. */
  children: React.ReactNode;
  /** The link at the end: "Read the release →". */
  action?: React.ReactNode;
}

/**
 * The strip above the site header for a release or an event: ink background,
 * the page canvas as text, a version tag in the soft accent. One line that
 * wraps and centres on phones.
 */
export const AnnouncementBar = React.forwardRef<HTMLDivElement, AnnouncementBarProps>(
  ({ tag, action, className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="region"
      aria-label="Announcement"
      className={cn(
        "flex w-full flex-wrap items-center justify-center gap-2.5 bg-ink px-6 py-[9px] text-center text-sm text-bg",
        className,
      )}
      {...props}
    >
      {tag && <span className="font-mono text-xs text-accent-soft">{tag}</span>}
      <span>{children}</span>
      {action && (
        <span className="font-bold [&_a]:text-bg [&_a]:no-underline [&_a:hover]:underline">{action}</span>
      )}
    </div>
  ),
);
AnnouncementBar.displayName = "AnnouncementBar";
