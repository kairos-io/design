import type { ReactNode } from "react";
import { KairosMark } from "../../components/Logo/Logo.tsx";
import {
  AppShell,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSection,
} from "../../components/Sidebar/Sidebar.tsx";

// The console shell every console deck shares: the Kairos mark and the
// product name, five sections of plain items with counts, and the backend
// and version in mono at the bottom. The decks draw it at full width, so the
// sidebar mode is "full" here; a host with a stored choice passes its own.

export const consoleNav: { label: string; items: { label: string; count?: string }[] }[] = [
  { label: "Overview", items: [{ label: "Dashboard" }] },
  {
    label: "Fleet",
    items: [
      { label: "Nodes", count: "1,284" },
      { label: "Groups", count: "18" },
    ],
  },
  {
    label: "Factory",
    items: [
      { label: "Artifacts", count: "42" },
      { label: "Extensions", count: "6" },
    ],
  },
  {
    label: "Deploy",
    items: [{ label: "BMC registration" }, { label: "Deployments", count: "3" }, { label: "Import" }],
  },
  { label: "Admin", items: [{ label: "Certificates" }, { label: "Settings" }] },
];

function Nav({ active }: { active: string }) {
  return (
    <SidebarNav>
      {consoleNav.map((section) => (
        <SidebarSection key={section.label} label={section.label}>
          {section.items.map((item) => (
            <SidebarItem
              key={item.label}
              href="#"
              label={item.label}
              count={item.count}
              active={item.label === active}
              onClick={(e) => e.preventDefault()}
            />
          ))}
        </SidebarSection>
      ))}
    </SidebarNav>
  );
}

function Footer() {
  return (
    <SidebarFooter>
      <span className="block font-mono text-xs">platform.local · v4.3.0</span>
      <span className="block font-mono text-xs">kairos</span>
    </SidebarFooter>
  );
}

export interface ConsoleShellProps {
  /** The label of the active navigation item. */
  active: string;
  children: ReactNode;
}

/** The console decks' shell, with the page laid out by its children. Wrapped in the console variant the decks use. */
export function ConsoleShell({ active, children }: ConsoleShellProps) {
  const mark = <KairosMark className="h-full w-auto" />;
  return (
    <div data-variant="console" className="min-h-screen bg-bg text-ink">
      <AppShell
        logo={<KairosMark className="h-[26px] w-auto" />}
        title={
          <>
            <b className="font-bold">Kairos</b> console
          </>
        }
        padded={false}
        sidebar={
          <Sidebar mode="full">
            <SidebarHeader
              logo={mark}
              title={
                <>
                  <b className="font-bold">Kairos</b> console
                </>
              }
            />
            <Nav active={active} />
            <Footer />
          </Sidebar>
        }
        drawer={
          <>
            <Nav active={active} />
            <Footer />
          </>
        }
      >
        {children}
      </AppShell>
    </div>
  );
}

/** A surface panel of the console pages: 4px corners, 16 to 22px padding, a bold 18px title. */
export function Panel({
  title,
  actions,
  className,
  children,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`flex flex-col gap-3.5 rounded-base bg-surface p-5 ${className ?? ""}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3">
          {title && <h2 className="m-0 text-lg font-bold leading-tight text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
