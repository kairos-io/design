import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { Check, ExternalLink, Menu, PanelLeftClose, PanelLeftOpen, X, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn.ts";
import { tilePoints } from "../../lib/tiles.ts";
import { Button } from "../Button/Button.tsx";

// The application shell of the Kairos console decks: a column on the side
// surface with mono section labels, the active item on the raised tone with
// an accent tile before it and its count after it. Composable pieces with no
// router and no app state: the host decides what is active and where links go.

/** The accent tile that marks the active item, and the dim one on the rail. */
function TileMark({ active }: { active: boolean }) {
  return (
    <svg width="12" height="8" viewBox="0 0 22 14" aria-hidden="true" focusable="false" className="shrink-0">
      <polygon points={tilePoints} className={active ? "fill-accent" : "fill-raised"} />
    </svg>
  );
}

/** "full" and "rail" are stored choices; "auto" follows the screen width (rail between md and lg, full at lg). */
export type SidebarMode = "full" | "rail" | "auto";

// Class helpers per mode. "full only" content shows on the full sidebar,
// "rail only" content shows on the icon rail. Written out so Tailwind finds them.
export const sidebarModeClasses = {
  label: { full: "", rail: "sr-only", auto: "sr-only lg:not-sr-only" } as Record<SidebarMode, string>,
  fullOnly: { full: "", rail: "hidden", auto: "hidden lg:block" } as Record<SidebarMode, string>,
  railOnly: { full: "hidden", rail: "", auto: "lg:hidden" } as Record<SidebarMode, string>,
  linkLayout: {
    full: "justify-start px-2.5",
    rail: "justify-center px-0",
    auto: "justify-center px-0 lg:justify-start lg:px-2.5",
  } as Record<SidebarMode, string>,
};

interface SidebarContextValue {
  mode: SidebarMode;
  setMode?: (mode: Exclude<SidebarMode, "auto">) => void;
  /** Called after a navigation item is activated; the drawer closes on it. */
  onNavigate?: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue>({ mode: "full" });

/** The sidebar's mode and callbacks, for custom items placed inside a Sidebar. */
export function useSidebar(): SidebarContextValue {
  return React.useContext(SidebarContext);
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  mode?: SidebarMode;
  /** Receives the user's collapse or expand choice; store it and pass it back as `mode`. */
  onModeChange?: (mode: Exclude<SidebarMode, "auto">) => void;
}

// Width of the desktop sidebar slot. A stored "full" sidebar between md and
// lg overlays the content: the slot stays 64px and the sidebar floats over
// the page.
const slotWidth: Record<SidebarMode, string> = {
  full: "md:w-16 lg:w-58",
  rail: "w-16",
  auto: "w-16 lg:w-58",
};

/** The desktop sidebar (md and wider): a column on the side surface that is full width, an icon rail, or responsive. */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ mode = "auto", onModeChange, className, children, ...props }, ref) => (
    <SidebarContext.Provider value={{ mode, setMode: onModeChange }}>
      <div className={cn("relative hidden shrink-0 md:flex", slotWidth[mode])}>
        <aside
          ref={ref}
          className={cn(
            "flex h-full flex-col border-r border-line bg-side text-ink",
            mode === "full" ? "w-58 md:absolute md:inset-y-0 md:left-0 md:z-40 lg:static" : "w-full",
            className,
          )}
          {...props}
        >
          {children}
        </aside>
      </div>
    </SidebarContext.Provider>
  ),
);
Sidebar.displayName = "Sidebar";

export interface SidebarHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** The logo on the full sidebar, usually a KairosLogo; give it `h-full w-auto` and the header sizes it. */
  logo: React.ReactNode;
  /** The logo on the icon rail, usually a KairosMark; the full logo is reused when absent. */
  railLogo?: React.ReactNode;
  /** The product name under the logo, hidden on the rail. */
  title: React.ReactNode;
}

/** The mark and the product name in one line at the top of the sidebar ("Kairos console"), with the collapse and expand controls when the host handles them. */
export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(function SidebarHeader(
  { logo, railLogo, title, className, ...props },
  ref,
) {
  const { mode, setMode } = useSidebar();
  const collapse = (cls?: string) => (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Collapse sidebar"
      title="Collapse sidebar"
      className={cn("opacity-70", cls)}
      onClick={() => setMode?.("rail")}
    >
      <PanelLeftClose className="h-4 w-4" />
    </Button>
  );
  const expand = (cls?: string) => (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Expand sidebar"
      title="Expand sidebar"
      className={cn("opacity-70", cls)}
      onClick={() => setMode?.("full")}
    >
      <PanelLeftOpen className="h-4 w-4" />
    </Button>
  );
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center gap-2.5 px-5 pt-6 pb-4",
        sidebarModeClasses.linkLayout[mode],
        className,
      )}
      {...props}
    >
      {railLogo ? (
        <>
          <div
            className={cn(
              "h-[26px] shrink-0",
              mode === "full" ? "flex" : mode === "rail" ? "hidden" : "hidden lg:flex",
            )}
          >
            {logo}
          </div>
          <div
            className={cn(
              "h-[26px] shrink-0",
              mode === "rail" ? "flex" : mode === "full" ? "hidden" : "flex lg:hidden",
            )}
          >
            {railLogo}
          </div>
        </>
      ) : (
        <div className="flex h-[26px] shrink-0">{logo}</div>
      )}
      <span
        className={cn("min-w-0 truncate text-[19px] leading-none text-ink", sidebarModeClasses.label[mode])}
      >
        {title}
      </span>
      {setMode && mode === "full" && collapse("absolute right-2 top-2")}
      {setMode && mode === "rail" && expand()}
      {setMode && mode === "auto" && (
        <>
          {collapse("absolute right-2 top-2 hidden lg:inline-flex")}
          {expand("lg:hidden")}
        </>
      )}
    </div>
  );
});
SidebarHeader.displayName = "SidebarHeader";

/** The thin line between the header, the navigation and the footer. */
export function SidebarDivider({ className }: { className?: string }) {
  return <div className={cn("mx-3.5 border-t border-line", className)} />;
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  /** The accessible name of the navigation landmark. */
  label?: string;
}

/** The scrolling navigation region. Put SidebarSections or SidebarItems inside. */
export const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(function SidebarNav(
  { label = "Main", className, children, ...props },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label={label}
      className={cn("flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-3.5 py-2", className)}
      {...props}
    >
      {children}
    </nav>
  );
});
SidebarNav.displayName = "SidebarNav";

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The group label; on the rail it becomes a divider and the label is read, not shown. */
  label?: React.ReactNode;
  children: React.ReactNode;
}

/** A labelled group of items: the label in the mono face, as the console decks set "Fleet" and "Factory". */
export const SidebarSection = React.forwardRef<HTMLDivElement, SidebarSectionProps>(function SidebarSection(
  { label, children, className, ...props },
  ref,
) {
  const { mode } = useSidebar();
  return (
    <div ref={ref} className={className} {...props}>
      {label && (
        <>
          <span
            className={cn("block px-2.5 pb-1.5 font-mono text-xs text-muted", sidebarModeClasses.label[mode])}
          >
            {label}
          </span>
          <div className={cn("mx-2 my-2 border-t border-line", sidebarModeClasses.railOnly[mode])} />
        </>
      )}
      <div className="space-y-px">{children}</div>
    </div>
  );
});
SidebarSection.displayName = "SidebarSection";

export interface SidebarItemProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  /** An icon before the label. The console decks use none: the active item carries an accent tile instead. */
  icon?: LucideIcon;
  label: string;
  /** A count after the label, in the mono face: "1,284" nodes, "18" groups. */
  count?: React.ReactNode;
  /** Marks the current page: the raised tone, bold, an accent tile, and aria-current. */
  active?: boolean;
  /** Opens in a new tab with an external-link mark; for server-rendered pages outside the app. */
  external?: boolean;
  /** Render the child (a router Link) with the item's classes instead of an <a>. */
  asChild?: boolean;
  children?: React.ReactNode;
}

/** One navigation entry: label and count, an accent tile when active, with the label spoken only on the rail. */
export const SidebarItem = React.forwardRef<HTMLAnchorElement, SidebarItemProps>(
  (
    {
      icon: Icon,
      label,
      count,
      active = false,
      external = false,
      asChild = false,
      className,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const { mode, onNavigate } = useSidebar();
    const classes = cn(
      "flex items-center gap-2.5 rounded-base py-[9px] text-[15px] no-underline transition-colors hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
      sidebarModeClasses.linkLayout[mode],
      active ? "bg-raised font-bold text-ink" : "text-sub hover:bg-hover hover:text-ink",
      className,
    );
    const content = (
      <>
        {Icon ? (
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <span
            className={cn(
              "flex w-3 shrink-0 justify-center",
              !active && (mode === "full" ? "invisible" : mode === "auto" ? "lg:invisible" : ""),
            )}
          >
            <TileMark active={active} />
          </span>
        )}
        <span className={cn("flex-1 truncate", sidebarModeClasses.label[mode])}>{label}</span>
        {count !== undefined && count !== "" && (
          <span
            className={cn(
              "font-mono text-xs",
              active ? "text-link" : "text-muted",
              sidebarModeClasses.fullOnly[mode],
            )}
          >
            {count}
          </span>
        )}
        {external && (
          <ExternalLink
            className={cn("h-3 w-3 opacity-60", sidebarModeClasses.fullOnly[mode])}
            aria-hidden="true"
          />
        )}
      </>
    );
    const shared = {
      ref,
      className: classes,
      "aria-label": label,
      "aria-current": active ? ("page" as const) : undefined,
      title: mode === "full" ? undefined : label,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        onNavigate?.();
      },
      ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
      ...props,
    };
    if (asChild) {
      return (
        <Slot {...shared}>
          {React.isValidElement<{ children?: React.ReactNode }>(children)
            ? React.cloneElement(children, undefined, content)
            : children}
        </Slot>
      );
    }
    return <a {...shared}>{content}</a>;
  },
);
SidebarItem.displayName = "SidebarItem";

/** The bottom of the sidebar: the backend and version in mono, the theme switch, logout. */
export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SidebarFooter({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("mt-auto space-y-1.5 px-6 py-3 text-[13px] text-muted", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SidebarFooter.displayName = "SidebarFooter";

/** The same item shape as Steps, so one array can drive both the rail and the progress list. */
export interface SidebarStep {
  id: string;
  label: string;
  /** "done" steps are reachable and show a check; "pending" ones stay disabled. "active" and "failed" are reachable. */
  state?: "pending" | "active" | "done" | "failed";
}

export interface SidebarStepsProps extends React.HTMLAttributes<HTMLElement> {
  steps: SidebarStep[];
  /** The id of the step being shown; it is marked current whatever its state. */
  current: string;
  onStepChange?: (id: string) => void;
  /** The heading over the list, also the navigation landmark's name. */
  label?: string;
}

/**
 * The web installer's step rail in the sidebar: the current step on the
 * raised tone with an accent tile, done steps with a check, the rest muted.
 * Steps not yet set stay disabled so a user cannot skip ahead.
 */
export const SidebarSteps = React.forwardRef<HTMLElement, SidebarStepsProps>(function SidebarSteps(
  { steps, current, onStepChange, label = "Steps", className, ...props },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label={label}
      className={cn(
        "grid flex-1 content-start gap-px overflow-y-auto overflow-x-hidden px-3.5 py-2",
        className,
      )}
      {...props}
    >
      <span className="block px-2.5 pb-1.5 font-mono text-xs text-muted">{label}</span>
      {steps.map((step, i) => {
        const isCurrent = step.id === current;
        const done = step.state === "done";
        const clickable = isCurrent || (step.state !== undefined && step.state !== "pending");
        return (
          <button
            key={step.id}
            type="button"
            disabled={!clickable}
            aria-current={isCurrent ? "step" : undefined}
            onClick={() => onStepChange?.(step.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-base px-2.5 py-[9px] text-left text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-not-allowed",
              isCurrent
                ? "bg-raised font-bold text-ink"
                : done
                  ? "text-sub enabled:hover:bg-hover enabled:hover:text-ink"
                  : "text-muted",
            )}
          >
            <span
              aria-hidden="true"
              className="flex w-3 shrink-0 items-center justify-center font-mono text-xs"
            >
              {isCurrent ? (
                <TileMark active />
              ) : done ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <TileMark active={false} />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate">{step.label}</span>
            <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
          </button>
        );
      })}
    </nav>
  );
});
SidebarSteps.displayName = "SidebarSteps";

export interface TopbarProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** The logo, usually a KairosLogo at 28 to 32px. */
  logo?: React.ReactNode;
  title?: React.ReactNode;
  /** Controls on the right: the theme switch, a menu button. */
  actions?: React.ReactNode;
  /** Where the brand links to. */
  href?: string;
}

/**
 * The top bar on the side surface: the app shell shows it below md in place
 * of the sidebar, and the installer's progress and message pages at every width.
 */
export const Topbar = React.forwardRef<HTMLElement, TopbarProps>(
  ({ logo, title, actions, href, className, children, ...props }, ref) => {
    const brand = (
      <>
        {logo}
        {title && <span className="text-[19px] leading-none text-ink">{title}</span>}
      </>
    );
    return (
      <header
        ref={ref}
        className={cn(
          "flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-side px-4 text-ink",
          className,
        )}
        {...props}
      >
        {href ? (
          <a
            href={href}
            aria-label={title ? undefined : "Home"}
            className="flex items-center gap-2 no-underline hover:no-underline"
          >
            {brand}
          </a>
        ) : (
          <div className="flex items-center gap-2">{brand}</div>
        )}
        {children}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
    );
  },
);
Topbar.displayName = "Topbar";

export interface AppShellProps {
  /** The desktop Sidebar. */
  sidebar: React.ReactNode;
  /** The drawer's content below md (usually the same nav and footer). Rendered in full mode. */
  drawer?: React.ReactNode;
  /** The logo for the top bar and the drawer header. */
  logo?: React.ReactNode;
  /** The product name. */
  title: React.ReactNode;
  /** Extra top bar controls, left of the menu button. */
  topbarActions?: React.ReactNode;
  /** Padding around the page; off for pages that lay themselves out. */
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Sidebar on the left from md up, a top bar with a drawer below. The
 * drawer is a dialog: it traps focus, closes on Escape, and closes when an
 * item inside it is activated.
 */
export function AppShell({
  sidebar,
  drawer,
  logo,
  title,
  topbarActions,
  padded = true,
  className,
  children,
}: AppShellProps) {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  return (
    <div className={cn("flex h-screen flex-col md:flex-row", className)}>
      <Topbar logo={logo} title={title} className="md:hidden">
        <div className="flex items-center gap-2">
          {topbarActions}
          {drawer && (
            <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
              <DialogPrimitive.Trigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation" className="opacity-100">
                  <Menu className="h-5 w-5" />
                </Button>
              </DialogPrimitive.Trigger>
              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay animate-fade-in" />
                <DialogPrimitive.Content
                  aria-describedby={undefined}
                  className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-side text-ink"
                >
                  <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <div className="flex items-center gap-2">
                      {logo}
                      <DialogPrimitive.Title className="text-[19px] leading-none text-ink">
                        {title}
                      </DialogPrimitive.Title>
                    </div>
                    <DialogPrimitive.Close asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Close navigation">
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogPrimitive.Close>
                  </div>
                  <SidebarDivider />
                  <SidebarContext.Provider value={{ mode: "full", onNavigate: close }}>
                    {drawer}
                  </SidebarContext.Provider>
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
          )}
        </div>
      </Topbar>
      {sidebar}
      <main className="min-w-0 flex-1 overflow-auto bg-bg text-ink">
        {padded ? <div className="p-4 md:p-6 lg:p-8">{children}</div> : children}
      </main>
    </div>
  );
}
