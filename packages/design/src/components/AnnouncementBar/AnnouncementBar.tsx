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
 * The strip above the site header for a release or an event: the deep
 * surface, which stays dark in both themes, with the code ink as text and a
 * version tag in the code key (the soft accent). One line that wraps and
 * centres on phones.
 */
export const AnnouncementBar = React.forwardRef<HTMLDivElement, AnnouncementBarProps>(
  ({ tag, action, className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="region"
      aria-label="Announcement"
      className={cn(
        "flex w-full flex-wrap items-center justify-center gap-2.5 bg-deep px-6 py-[9px] text-center text-sm text-code-ink",
        className,
      )}
      {...props}
    >
      {tag && <span className="font-mono text-xs text-code-key">{tag}</span>}
      <span>{children}</span>
      {action && (
        <span className="font-bold [&_a]:text-code-ink [&_a]:no-underline [&_a:hover]:underline">
          {action}
        </span>
      )}
    </div>
  ),
);
AnnouncementBar.displayName = "AnnouncementBar";
