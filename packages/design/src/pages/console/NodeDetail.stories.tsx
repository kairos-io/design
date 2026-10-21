import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "../../components/Badge/Badge.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { Chip } from "../../components/Chip/Chip.tsx";
import { DescriptionList } from "../../components/DescriptionList/DescriptionList.tsx";
import { Gauge, Sparkline, TileMeter } from "../../components/Gauge/Gauge.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl.tsx";
import { StatTile } from "../../components/StatTile/StatTile.tsx";
import { StatusBadge } from "../../components/StatusBadge/StatusBadge.tsx";
import { StatusDot } from "../../components/StatusDot/StatusDot.tsx";
import { ConsoleShell, Panel } from "./ConsoleShell.tsx";

const meta = {
  title: "Pages/Kairos console/Node detail",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fleet › Nodes › edge-store-0143, from `Kairos Console - Node Detail.dc.html`: the health strip, live gauges for CPU, memory and temperature with sparklines, the disks as tile meters, the command history and the node's details, extensions and labels. Built from AppShell and Sidebar, PageHeader, StatusBadge, StatTile, Gauge, Sparkline, TileMeter, SegmentedControl, StatusDot, DescriptionList, Badge, Chip and Button, in `data-variant=\"console\"`. \"Show high load\" pushes the CPU over 85% and the gauges turn red, as the deck does.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const disks = [
  { label: "Persistent", used: "182 GB", total: "420 GB", p: 43 },
  { label: "State (A/B)", used: "2.4 GB", total: "8 GB", p: 30 },
  { label: "Recovery", used: "1.1 GB", total: "4 GB", p: 28 },
  { label: "OEM", used: "42 MB", total: "64 MB", p: 66 },
];

const commands = [
  { title: "Upgrade", detail: "image quay.io/kairos/hadron:v0.5.2-k3s · rollout r-0412", at: "20:44", tone: "success", outline: false },
  { title: "Reboot", detail: "after upgrade", at: "20:45", tone: "success", outline: false },
  { title: "Run command", detail: "kubectl get nodes -o wide", at: "20:51", tone: "info", outline: true },
  { title: "Apply config", detail: "cloud-config · 12 lines", at: "yesterday", tone: "danger", outline: false },
  { title: "Upgrade recovery", detail: "hadron-v0.5.0", at: "3d", tone: "success", outline: false },
] as const;

type CommandFilter = "all" | "running" | "failed";
const commandFilters: { value: CommandFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "failed", label: "Failed" },
];

function Meter({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-base bg-inner p-4">
      <span className="text-[13px] font-bold text-muted">{title}</span>
      {children}
    </div>
  );
}

function NodeDetailPage() {
  const [high, setHigh] = useState(false);
  const [tick, setTick] = useState(0);
  const [commandFilter, setCommandFilter] = useState<CommandFilter>("all");
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, []);
  const wobble = (base: number, amp: number, k: number) => base + Math.sin((tick + k) * 1.3) * amp;
  const cpu = high ? wobble(91, 3, 0) : wobble(38, 6, 0);
  const mem = high ? 88 : wobble(61, 2, 3);
  const temp = high ? 81 : wobble(54, 2, 5);
  const load1 = high ? "7.6" : (2.9 + Math.sin(tick) * 0.3).toFixed(1);
  const cpuSeries = Array.from({ length: 30 }, (_, i) =>
    high ? (i < 20 ? 40 + Math.sin(i) * 8 : 88 + Math.sin(i) * 4) : 36 + Math.sin(i * 0.7 + tick) * 9,
  );
  const memSeries = Array.from({ length: 30 }, (_, i) => (high ? Math.min(90, 60 + i) : 60 + Math.sin(i * 0.4) * 2));
  const shownCommands = commands.filter(
    (c) => commandFilter === "all" || (commandFilter === "running" ? c.outline : c.tone === "danger"),
  );
  return (
    <ConsoleShell active="Nodes">
      <main className="flex flex-col gap-5 px-7 pt-[22px] pb-12">
        <PageHeader
          mono
          title="edge-store-0143"
          className="mb-0"
          breadcrumb={[
            { label: "Fleet", href: "#" },
            { label: "Nodes", href: "#" },
            { label: "retail-eu", href: "#" },
            { label: "edge-store-0143" },
          ]}
          status={
            <StatusBadge status="Online" />
          }
          meta={
            <>
              <span className="font-mono text-xs">10.40.12.143</span>
              <span>retail-eu</span>
              <span>Image hadron-v0.5.2</span>
              <span>Kairos v4.3.0</span>
            </>
          }
        >
          <Button variant="outline" size="sm" className="text-[15px]">
            Reboot
          </Button>
          <Button variant="outline" size="sm" className="text-[15px]">
            Upgrade
          </Button>
          <Button size="sm" className="text-[15px]">
            Send command
          </Button>
          <Button variant="outline" size="icon" aria-label="More actions" className="h-[38px] w-[38px]">
            <MoreHorizontal />
          </Button>
        </PageHeader>

        {high && (
          <div role="alert" className="grid grid-cols-[18px_1fr] gap-2.5 rounded-base bg-warn-bg px-4 py-3 text-[15px]">
            <StatusDot size={13} tone="warning" className="mt-1" />
            <span>
              <b>CPU above 85%</b> for the last 10 samples. Load {load1} on 8 vCPU.
            </span>
          </div>
        )}

        <section className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2" aria-label="Health">
          <StatTile size="sm" tone="success" label="Connection" value="Online" sub="Heartbeat 4s ago" />
          <StatTile size="sm" tone="success" label="Boot" value="Active" sub="Booted from the active image" />
          <StatTile size="sm" mono label="Image version" value="hadron-v0.5.2" sub="k3s 1.36.4" />
          <StatTile size="sm" mono label="Kairos version" value="v4.3.0" sub="Hadron · standard" />
          <StatTile size="sm" label="Reset" value="Never" sub="No reset pending" />
        </section>

        <Panel
          title="Resources"
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs text-muted">live · sampled {2 + (tick % 5)}s ago</span>
              <Button variant="outline" size="sm" aria-pressed={high} onClick={() => setHigh((h) => !h)}>
                {high ? "Show normal load" : "Show high load"}
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2.5">
            <Meter title="CPU">
              <div className="flex items-center gap-4">
                <Gauge value={cpu} label="CPU" sub="CPU" />
                <div className="flex flex-col gap-1 text-sm text-sub">
                  <span>
                    Load{" "}
                    <b className="font-mono text-[13px] text-ink">
                      {load1} / {high ? "6.9" : "2.7"} / {high ? "4.1" : "2.4"}
                    </b>
                  </span>
                  <span>8 vCPU · x86_64</span>
                </div>
              </div>
              <Sparkline values={cpuSeries} tone={high ? "danger" : undefined} aria-label="CPU over the last minute" />
            </Meter>
            <Meter title="Memory">
              <div className="flex items-center gap-4">
                <Gauge value={mem} label="Memory" sub="of 16 GiB" />
                <div className="flex flex-col gap-1 text-sm text-sub">
                  <span>
                    <b className="text-ink">{((16 * mem) / 100).toFixed(1)} GiB</b> used
                  </span>
                  <span>{(16 - (16 * mem) / 100).toFixed(1)} GiB available</span>
                </div>
              </div>
              <Sparkline values={memSeries} tone={high ? "warning" : undefined} aria-label="Memory over the last minute" />
            </Meter>
            <Meter title="Disk">
              {disks.map((d) => (
                <div key={d.label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between gap-2.5 text-sm">
                    <span className="font-semibold">{d.label}</span>
                    <span className="font-mono text-xs text-muted">
                      {d.used} / {d.total}
                    </span>
                  </div>
                  <TileMeter value={d.p} aria-label={`${d.label} partition`} valueText={`${d.used} of ${d.total}`} />
                </div>
              ))}
            </Meter>
            <Meter title="System">
              <div className="flex items-center gap-4">
                <Gauge value={temp} unit="°" label="Temperature" sub="temperature" />
                <div className="flex flex-col gap-2 text-sm text-sub">
                  <span>
                    Uptime <b className="text-ink">3d 14h</b>
                  </span>
                  <span>
                    Load 1m <b className="font-mono text-[13px] text-ink">{load1}</b>
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-3 bg-kairos-mid" aria-hidden="true" /> under 70%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-3 bg-status-warning" aria-hidden="true" /> 70–85%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-3 bg-status-recovery" aria-hidden="true" /> over 85%
                </span>
              </div>
            </Meter>
          </div>
        </Panel>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Panel
            title="Commands"
            actions={
              <Button variant="outline" size="sm">
                + New
              </Button>
            }
          >
            <SegmentedControl<CommandFilter>
              aria-label="Command filter"
              value={commandFilter}
              onChange={setCommandFilter}
              options={commandFilters}
              fill={false}
              className="w-max"
            />
            <ul className="m-0 list-none p-0">
              {shownCommands.map((c) => (
                <li key={c.title + c.at} className="grid grid-cols-[16px_1fr_auto] items-start gap-3 border-t border-line py-2.5">
                  <StatusDot size={11} tone={c.tone} outline={c.outline} className="mt-1" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[15px] font-bold">{c.title}</span>
                    <span className="font-mono text-xs text-sub wrap-anywhere">{c.detail}</span>
                  </div>
                  <span className="font-mono text-xs text-muted">{c.at}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <div className="flex flex-col gap-4">
            <Panel title="Details" className="gap-1">
              <DescriptionList
                items={[
                  { term: "Machine ID", value: "7f3a1…c09e2", mono: true },
                  { term: "Seen from", value: "10.40.12.143 · remote IP", mono: true },
                  { term: "Reported", value: "eth0 10.40.12.143 · wlan0 —", mono: true },
                  { term: "Group", value: "retail-eu ▾" },
                  { term: "Claimed", value: "store-key-0143 · 3d", mono: true },
                  { term: "Registered", value: "3 Oct 2026" },
                ]}
              />
            </Panel>
            <Panel
              title="Installed extensions"
              actions={
                <Button variant="link" className="h-auto p-0 text-[13px] font-bold">
                  Install…
                </Button>
              }
              className="gap-2.5"
            >
              {[
                { type: "sysext", name: "tailscale", v: "1.84.0", boot: "active" },
                { type: "confext", name: "store-pos-config", v: "2026.10", boot: "common" },
              ].map((x) => (
                <div key={x.name} className="flex items-center gap-2 text-sm">
                  <Badge>{x.type}</Badge>
                  <b>{x.name}</b>
                  <span className="font-mono text-xs text-muted">{x.v}</span>
                  <span className="ml-auto text-xs text-muted">{x.boot}</span>
                </div>
              ))}
            </Panel>
            <Panel title="Labels" className="gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {["store=0143", "region=eu-west", "pos=v7", "canary=false"].map((l) => (
                  <Chip key={l}>{l}</Chip>
                ))}
                <Button variant="link" className="h-auto px-2 py-1 text-[13px] font-bold">
                  + Add
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </ConsoleShell>
  );
}

export const NodeDetail: Story = {
  name: "Node detail",
  render: () => <NodeDetailPage />,
};
