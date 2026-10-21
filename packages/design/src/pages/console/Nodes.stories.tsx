import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../../components/Button/Button.tsx";
import { FilterChip } from "../../components/FilterChip/FilterChip.tsx";
import { Input } from "../../components/Input/Input.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { StatTile } from "../../components/StatTile/StatTile.tsx";
import { StatusBadge } from "../../components/StatusBadge/StatusBadge.tsx";
import { StatusDot } from "../../components/StatusDot/StatusDot.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/Table/Table.tsx";
import { Tile } from "../../components/Tiles/Tile.tsx";
import { tilePoints } from "../../lib/tiles.ts";
import { phaseLook } from "../../lib/tone.ts";
import { ConsoleShell } from "./ConsoleShell.tsx";
import { fleetStats, nodeStateOrder, nodes, type Node, type NodeState } from "./data.ts";

const meta = {
  title: "Pages/Kairos console/Nodes",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fleet › Nodes, from `Kairos Console - Nodes.dc.html`: the node list with its summary band, the rollout in progress as a tile bar, status filters, and the selected node's side panel. Built from AppShell and Sidebar, PageHeader, Input, Button, StatTile, Tile, FilterChip, Table, StatusBadge and StatusDot. The page sits in `data-variant=\"console\"`, which the decks use for a lighter hairline in the light theme. Pick a row or a filter: the panel and the list follow.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Filter = "all" | NodeState;
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...nodeStateOrder.map((s) => ({ id: s, label: s })),
];

// The rollout bar of the deck: 104 nodes upgraded, six rebooting into the
// new image as outlined tiles, the rest waiting on the raised tone.
function RolloutBar({ total, done, inProgress }: { total: number; done: number; inProgress: number }) {
  return (
    <div
      role="progressbar"
      aria-label="Rollout r-0412"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-valuetext={`${done} of ${total} nodes upgraded, ${inProgress} in progress`}
      className="flex flex-wrap gap-0.5"
    >
      {Array.from({ length: total }, (_, i) =>
        i < done ? (
          <Tile key={i} size={15} tone={(i % 3) as 0 | 1 | 2} />
        ) : i < done + inProgress ? (
          <svg key={i} width={15} height={(15 * 14) / 22} viewBox="0 0 22 14" aria-hidden="true" className="shrink-0">
            <polygon points={tilePoints} className="fill-none stroke-accent" strokeWidth={2} />
          </svg>
        ) : (
          <Tile key={i} size={15} tone="rest" className="[&_polygon]:fill-raised" />
        ),
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted">
      <span className="flex items-center gap-1.5">
        <Tile size={14} tone={2} /> upgraded
      </span>
      <span className="flex items-center gap-1.5">
        <svg width={14} height={9} viewBox="0 0 22 14" aria-hidden="true">
          <polygon points={tilePoints} className="fill-none stroke-accent" strokeWidth={2} />
        </svg>
        in progress
      </span>
      <span className="flex items-center gap-1.5">
        <Tile size={14} tone="rest" className="[&_polygon]:fill-raised" /> waiting
      </span>
      <Button variant="link" className="ml-auto h-auto p-0 text-[13px] font-bold">
        Pause rollout
      </Button>
    </div>
  );
}

function Partition({ name, value, tag, current }: { name: string; value: string; tag?: string; current?: boolean }) {
  return (
    <div
      className={`grid grid-cols-[72px_1fr_auto] items-center gap-2.5 rounded-base bg-surface px-3 py-2.5 text-sm ${
        current ? "[box-shadow:inset_3px_0_0_var(--accent)]" : ""
      }`}
    >
      <span className="font-bold">{name}</span>
      <span className="font-mono text-xs text-sub">{value}</span>
      <span className="font-mono text-xs text-accent-soft">{tag}</span>
    </div>
  );
}

function NodePanel({ node }: { node: Node }) {
  const upgrading = node.status === "Upgrading";
  const timeline = upgrading
    ? [
        { text: "Rollout r-0412 started", at: "20:41", tone: "neutral" as const, outline: false },
        { text: "Image pulled · 412 MB", at: "20:42", tone: "neutral" as const, outline: false },
        { text: "Written to state B", at: "20:44", tone: "neutral" as const, outline: false },
        { text: "Rebooting into v0.5.2", at: "now", tone: "info" as const, outline: false },
        { text: "Health check", at: "—", tone: "neutral" as const, outline: true },
      ]
    : [
        { text: "Registered with Fleet", at: "3d", tone: "neutral" as const, outline: false },
        { text: "Last upgrade applied", at: "2d", tone: "neutral" as const, outline: false },
        { text: "Heartbeat", at: node.seen, status: node.status },
      ];
  return (
    <aside className="flex w-full flex-col gap-5 border-t border-line bg-side px-5.5 py-6 lg:w-[340px] lg:shrink-0 lg:border-l lg:border-t-0">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-xs text-muted">selected node</span>
        <span className="font-mono text-[17px]">{node.name}</span>
        <StatusBadge bare status={node.status} className="text-[15px]">
          {node.status} · {node.group}
        </StatusBadge>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-muted">Partitions</span>
        <Partition
          name="Active"
          value={upgrading ? "hadron-v0.5.1 · state A" : `${node.image.split(" · ")[0]} · state A`}
          tag={upgrading ? "" : "booted"}
          current={!upgrading}
        />
        <Partition
          name="Passive"
          value={upgrading ? "hadron-v0.5.2 · state B" : "previous · state B"}
          tag={upgrading ? "next boot" : ""}
          current={upgrading}
        />
        <Partition name="Recovery" value="hadron-v0.5.0 · recovery" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="pb-1.5 text-[13px] font-bold text-muted">Activity</span>
        {timeline.map((t) => (
          <div key={t.text} className="grid grid-cols-[14px_1fr_auto] items-center gap-2.5 py-[7px] text-sm">
            {"status" in t ? (
              <StatusDot size={9} tone={phaseLook(t.status).tone} outline={phaseLook(t.status).outline} />
            ) : (
              <StatusDot size={9} tone={t.tone} outline={t.outline} />
            )}
            <span>{t.text}</span>
            <span className="font-mono text-xs text-muted">{t.at}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 rounded-base bg-surface p-3 font-mono text-xs text-sub">
        <span>cpu 8 × x86_64 · mem 16 GiB</span>
        <span>tpm 2.0 sealed · secure boot on</span>
        <span>k3s 1.36.4 · labels: store=0143</span>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="text-sm">
          Reboot
        </Button>
        <Button variant="outline" size="sm" className="text-sm">
          Roll back
        </Button>
        <Button variant="destructive" size="sm" className="col-span-2 text-sm">
          Reset to recovery
        </Button>
      </div>
    </aside>
  );
}

function NodesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState("edge-store-0143");
  const shown = nodes.filter((n) => filter === "all" || n.status === filter);
  const node = nodes.find((n) => n.name === selected) ?? nodes[0];
  const count = (f: Filter) => (f === "all" ? nodes.length : nodes.filter((n) => n.status === f).length);
  return (
    <ConsoleShell active="Nodes">
      <div className="flex min-h-full flex-col">
        <div className="border-b border-line px-7 pt-4">
          <PageHeader eyebrow="fleet / nodes" title="Nodes" className="mb-4">
            <Input mono placeholder="search hostname, image, label" aria-label="Search nodes" className="w-[260px] py-2 text-xs" />
            <Button variant="outline" size="sm" className="text-[15px]">
              Build artifact
            </Button>
            <Button size="sm" className="text-[15px]">
              Roll out upgrade
            </Button>
          </PageHeader>
        </div>
        <div className="flex flex-1 flex-col lg:flex-row">
          <main className="flex min-w-0 flex-1 flex-col gap-[18px] px-7 py-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
              {fleetStats.map((s) => (
                <StatTile key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
            <section className="flex flex-col gap-3 rounded-base bg-surface px-[18px] py-4">
              <div className="flex flex-wrap justify-between gap-3 text-[15px]">
                <span>
                  <b>Rollout r-0412</b> <span className="text-sub">· retail-eu → hadron v0.5.2 · canary passed</span>
                </span>
                <span className="font-mono text-xs text-muted">766 / 812 nodes</span>
              </div>
              <RolloutBar total={120} done={104} inProgress={6} />
              <Legend />
            </section>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
              {filters.map((f) => (
                <FilterChip
                  key={f.id}
                  selected={filter === f.id}
                  status={f.id === "all" ? undefined : f.id}
                  count={count(f.id)}
                  onSelect={() => setFilter(f.id)}
                >
                  {f.label}
                </FilterChip>
              ))}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Node</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((n) => (
                  <TableRow
                    key={n.name}
                    data-state={n.name === selected ? "selected" : undefined}
                    tabIndex={0}
                    aria-selected={n.name === selected}
                    onClick={() => setSelected(n.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(n.name);
                      }
                    }}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
                  >
                    <TableCell className="font-mono text-xs whitespace-nowrap">{n.name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StatusBadge bare status={n.status} className="text-[15px] font-medium" />
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate font-mono text-xs text-sub">{n.image}</TableCell>
                    <TableCell className="text-sm text-sub">{n.group}</TableCell>
                    <TableCell className="font-mono text-xs text-muted">{n.seen}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </main>
          <NodePanel node={node} />
        </div>
      </div>
    </ConsoleShell>
  );
}

export const Nodes: Story = {
  render: () => <NodesPage />,
};
