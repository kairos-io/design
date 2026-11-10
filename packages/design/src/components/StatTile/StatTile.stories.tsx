import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cpu, HardDrive, MemoryStick, Server } from "lucide-react";
import { MeterBar, StackBar, StatTile } from "./StatTile.tsx";

const meta = {
  title: "Components/StatTile",
  component: StatTile,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "One cell of a summary band at the top of a dashboard or detail page: a label in the muted ink, one large number and a line of context, on a surface with no border. Four to six tiles in a row. The `lg` size is the nodes page's band (34px); `sm` is the node detail's health strip (19px bold), where a tone draws a 3px bar along the top. MeterBar and StackBar are the two small bars the tiles and tables share; TileMeter is the full-width disk meter.",
      },
    },
  },
  argTypes: {
    icon: { table: { disable: true } },
    tone: { control: "select", options: [undefined, "success", "warning", "danger", "info", "neutral"] },
  },
  args: { label: "Nodes", icon: Server, value: 24, sub: "21 online" },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SummaryBand: Story = {
  name: "A summary band",
  render: () => (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Nodes" icon={Server} value={24} sub="21 online, 2 pending, 1 offline">
        <StackBar
          className="mt-2"
          counts={[
            { tone: "success", count: 21, label: "online" },
            { tone: "warning", count: 2, label: "pending" },
            { tone: "danger", count: 1, label: "offline" },
          ]}
        />
      </StatTile>
      <StatTile label="CPU" icon={Cpu} value="41%" sub="fleet average" tone="success" />
      <StatTile label="Memory" icon={MemoryStick} value="83%" sub="2 nodes above 90%" tone="warning" />
      <StatTile label="Disk" icon={HardDrive} value="94%" sub="edge-03: 2 GB free" tone="danger" />
    </div>
  ),
};

export const HealthStrip: Story = {
  name: "The health strip",
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2">
      <StatTile size="sm" tone="success" label="Connection" value="Online" sub="Heartbeat 4s ago" />
      <StatTile size="sm" tone="success" label="Boot" value="Active" sub="Booted from the active image" />
      <StatTile size="sm" mono label="Image version" value="hadron-v0.5.2" sub="k3s 1.36.4" />
      <StatTile size="sm" mono label="Kairos version" value="v4.3.0" sub="Hadron · standard" />
      <StatTile size="sm" label="Reset" value="Never" sub="No reset pending" />
    </div>
  ),
};

export const Meter: Story = {
  name: "MeterBar",
  render: () => (
    <div className="grid w-40 gap-2 text-sm">
      <MeterBar value={34} />
      <MeterBar value={82} />
      <MeterBar value={96} />
      <MeterBar value={null} />
    </div>
  ),
};

export const Stack: Story = {
  name: "StackBar",
  render: () => (
    <div className="grid max-w-sm gap-3">
      <StackBar
        counts={[
          { tone: "success", count: 8, label: "ready" },
          { tone: "info", count: 3, label: "building" },
          { tone: "danger", count: 1, label: "failed" },
        ]}
      />
      <StackBar counts={[]} />
    </div>
  ),
};
