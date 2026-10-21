import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  BookOpen,
  Download,
  FolderTree,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  Puzzle,
  Rocket,
  Server,
  ServerCog,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../Button/Button.tsx";
import { KairosLogo, KairosMark } from "../Logo/Logo.tsx";
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
          "The navy application shell: a sidebar from md up (full at lg, an icon rail between md and lg, or the user's stored choice), and a top bar with a drawer below md. The pieces compose and carry no router: the host marks the active item and passes its own Link through `asChild`. `SidebarSteps` is the web installer's step rail.",
      },
    },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

type NavItem = { to: string; icon: LucideIcon; label: string; external?: boolean };
const nav: { label?: string; items: NavItem[] }[] = [
  { items: [{ to: "/", icon: LayoutDashboard, label: "Dashboard" }] },
  {
    label: "Fleet",
    items: [
      { to: "/nodes", icon: Server, label: "Nodes" },
      { to: "/groups", icon: FolderTree, label: "Groups" },
    ],
  },
  {
    label: "Build",
    items: [
      { to: "/artifacts", icon: Package, label: "Artifacts" },
      { to: "/extensions", icon: Puzzle, label: "Extensions" },
    ],
  },
  {
    label: "Deploy",
    items: [
      { to: "/bmc", icon: ServerCog, label: "BMC Registration" },
      { to: "/deployments", icon: Rocket, label: "Deployments" },
      { to: "/import", icon: Download, label: "Import" },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/certificates", icon: KeyRound, label: "Certificates" },
      { to: "/settings", icon: Settings, label: "Settings" },
    ],
  },
  { label: "Developer", items: [{ to: "/api/docs", icon: BookOpen, label: "API docs", external: true }] },
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
              icon={item.icon}
              label={item.label}
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
// classes show one, exactly as AuroraBoot's SidebarFooter does.
function Footer() {
  const { mode } = useSidebar();
  return (
    <SidebarFooter>
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
        variant="on-navy"
        aria-label="Logout"
        title={mode === "full" ? undefined : "Logout"}
        className={`w-full gap-3 ${sidebarModeClasses.linkLayout[mode]}`}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span className={sidebarModeClasses.label[mode]}>Logout</span>
      </Button>
    </SidebarFooter>
  );
}

function Shell({ initialMode = "auto" }: { initialMode?: SidebarMode }) {
  const [mode, setMode] = useState<SidebarMode>(initialMode);
  const [active, setActive] = useState("/nodes");
  const logo = <KairosLogo variant="white" className="h-8 w-auto" />;
  return (
    <AppShell
      logo={logo}
      title="AuroraBoot"
      sidebar={
        <Sidebar mode={mode} onModeChange={setMode}>
          <SidebarHeader
            logo={<KairosLogo variant="white" className="h-full w-auto" />}
            railLogo={<KairosMark variant="white" className="h-full w-auto" />}
            title="AuroraBoot"
          />
          <SidebarDivider />
          <Nav active={active} onPick={setActive} />
          <SidebarDivider />
          <Footer />
        </Sidebar>
      }
      drawer={
        <>
          <Nav active={active} onPick={setActive} />
          <SidebarDivider />
          <Footer />
        </>
      }
    >
      <PageHeader title="Nodes" description="Every machine that has registered with this AuroraBoot.">
        <Button variant="outline">Register token</Button>
        <Button>Deploy</Button>
      </PageHeader>
      <div className="rounded-lg border bg-surface p-6 text-sm text-muted">
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
      logo={<KairosLogo variant="white" className="h-7 w-auto" decorative />}
      title="Web Installer"
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

function Wizard() {
  const [current, setCurrent] = useState("network");
  const steps = <SidebarSteps steps={installerSteps} current={current} onStepChange={setCurrent} />;
  return (
    <AppShell
      logo={<KairosLogo variant="white" className="h-7 w-auto" decorative />}
      title="Web Installer"
      className="h-[640px]"
      sidebar={
        <Sidebar mode="full">
          <SidebarHeader
            logo={<KairosLogo variant="white" className="h-full w-auto" />}
            title="Web Installer"
          />
          <SidebarDivider />
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
      <div className="rounded-lg border bg-surface p-6 text-sm text-muted">The step's form.</div>
    </AppShell>
  );
}

export const WizardShell: Story = {
  name: "Wizard shell",
  render: () => <Wizard />,
};
