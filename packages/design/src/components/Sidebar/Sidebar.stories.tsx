import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "../Button/Button.tsx";
import { KairosMark } from "../Logo/Logo.tsx";
import { PageHeader } from "../PageHeader/PageHeader.tsx";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle.tsx";
import {
  AppShell,
  Sidebar,
  SidebarDivider,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSection,
  SidebarSteps,
  type SidebarStep,
  Topbar,
  sidebarModeClasses,
  useSidebar,
  type SidebarMode,
} from "./Sidebar.tsx";

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The application shell of the Kairos console decks: a column on the side surface from md up (full at lg, an icon rail between md and lg, or the user's stored choice), and a top bar with a drawer below md. Section labels are mono; the active item sits on the raised tone with an accent tile before it and its count after it. The pieces compose and carry no router: the host marks the active item and passes its own Link through `asChild`. `SidebarSteps` is the installer's step rail.",
      },
    },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

type NavItem = { to: string; label: string; count?: string; external?: boolean };
const nav: { label?: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ to: "/", label: "Dashboard" }] },
  {
    label: "Fleet",
    items: [
      { to: "/nodes", label: "Nodes", count: "1,284" },
      { to: "/groups", label: "Groups", count: "18" },
    ],
  },
  {
    label: "Factory",
    items: [
      { to: "/artifacts", label: "Artifacts", count: "42" },
      { to: "/extensions", label: "Extensions", count: "6" },
    ],
  },
  {
    label: "Deploy",
    items: [
      { to: "/bmc", label: "BMC registration" },
      { to: "/deployments", label: "Deployments", count: "3" },
      { to: "/import", label: "Import" },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/certificates", label: "Certificates" },
      { to: "/settings", label: "Settings" },
    ],
  },
  { label: "Developer", items: [{ to: "/api/docs", label: "API docs", external: true }] },
];

function Nav({ active, onPick }: { active: string; onPick: (to: string) => void }) {
  return (
    <SidebarNav>
      {nav.map((section, i) => (
        <SidebarSection key={i} label={section.label}>
          {section.items.map((item) => (
            <SidebarItem
              key={item.to}
              href={item.to}
              label={item.label}
              count={item.count}
              active={item.to === active}
              external={item.external}
              onClick={(e) => {
                e.preventDefault();
                onPick(item.to);
              }}
            />
          ))}
        </SidebarSection>
      ))}
    </SidebarNav>
  );
}

// The footer renders the full and the compact theme switch and lets the mode
// classes show one.
function Footer() {
  const { mode } = useSidebar();
  return (
    <SidebarFooter>
      <span className="block font-mono text-xs">platform.local · v4.3.0</span>
      {mode !== "rail" && (
        <div className={sidebarModeClasses.fullOnly[mode]}>
          <ThemeToggle />
        </div>
      )}
      {mode !== "full" && (
        <div className={`flex justify-center ${sidebarModeClasses.railOnly[mode]}`}>
          <ThemeToggle compact />
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        aria-label="Logout"
        title={mode === "full" ? undefined : "Logout"}
        className={`-mx-2.5 w-[calc(100%+20px)] gap-3 ${sidebarModeClasses.linkLayout[mode]}`}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span className={sidebarModeClasses.label[mode]}>Logout</span>
      </Button>
    </SidebarFooter>
  );
}

const title = (
  <>
    <b className="font-bold">Kairos</b> console
  </>
);

function Shell({ initialMode = "auto" }: { initialMode?: SidebarMode }) {
  const [mode, setMode] = useState<SidebarMode>(initialMode);
  const [active, setActive] = useState("/nodes");
  return (
    <AppShell
      logo={<KairosMark className="h-[26px] w-auto" />}
      title={title}
      sidebar={
        <Sidebar mode={mode} onModeChange={setMode}>
          <SidebarHeader
            logo={<KairosMark className="h-full w-auto" />}
            railLogo={<KairosMark className="h-full w-auto" />}
            title={title}
          />
          <Nav active={active} onPick={setActive} />
          <Footer />
        </Sidebar>
      }
      drawer={
        <>
          <Nav active={active} onPick={setActive} />
          <Footer />
        </>
      }
    >
      <PageHeader
        eyebrow="fleet / nodes"
        title="Nodes"
        description="Every machine that has registered with this console."
      >
        <Button variant="outline">Build artifact</Button>
        <Button>Roll out upgrade</Button>
      </PageHeader>
      <div className="rounded-base bg-surface p-6 text-sm text-sub">
        Page content goes here. Resize the viewport: the sidebar becomes an icon rail below 1024px and a
        drawer below 768px.
      </div>
    </AppShell>
  );
}

export const AppShellStory: Story = {
  name: "App shell",
  render: () => <Shell />,
};

export const Rail: Story = {
  name: "App shell, rail stored",
  render: () => <Shell initialMode="rail" />,
};

export const Full: Story = {
  name: "App shell, full stored",
  render: () => <Shell initialMode="full" />,
};

export const TopbarOnly: Story = {
  name: "Top bar",
  parameters: { layout: "padded" },
  render: () => (
    <Topbar
      href="#"
      logo={<KairosMark className="h-[26px] w-auto" decorative />}
      title={
        <>
          <b className="font-bold">Kairos</b> Installer
        </>
      }
      actions={<ThemeToggle compact />}
      className="rounded-base"
    />
  ),
};

const installerSteps: SidebarStep[] = [
  { id: "device", label: "Target device", state: "done" },
  { id: "users", label: "Users and SSH keys", state: "done" },
  { id: "network", label: "Network", state: "active" },
  { id: "k8s", label: "Kubernetes", state: "pending" },
  { id: "review", label: "Review and install", state: "pending" },
];

const installerTitle = (
  <>
    <b className="font-bold">Kairos</b> Installer
  </>
);

function Wizard() {
  const [current, setCurrent] = useState("network");
  const steps = <SidebarSteps steps={installerSteps} current={current} onStepChange={setCurrent} />;
  return (
    <AppShell
      logo={<KairosMark className="h-[26px] w-auto" decorative />}
      title={installerTitle}
      className="h-[640px]"
      sidebar={
        <Sidebar mode="full">
          <SidebarHeader logo={<KairosMark className="h-full w-auto" />} title={installerTitle} />
          {steps}
          <SidebarDivider />
          <SidebarFooter>
            <ThemeToggle />
          </SidebarFooter>
        </Sidebar>
      }
      drawer={
        <>
          {steps}
          <SidebarDivider />
          <SidebarFooter>
            <ThemeToggle />
          </SidebarFooter>
        </>
      }
    >
      <PageHeader
        title="Network"
        description="How this node reaches the registry and the rest of the cluster."
      />
      <div className="rounded-base bg-surface p-6 text-sm text-sub">The step's form.</div>
    </AppShell>
  );
}

export const WizardShell: Story = {
  name: "Wizard shell",
  render: () => <Wizard />,
};
