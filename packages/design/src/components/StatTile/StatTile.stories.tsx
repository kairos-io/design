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
          "One cell of a summary band at the top of a dashboard or detail page: a label, one large number and a line of context. Four to six tiles in a row; a tone colours the icon when the number carries a status. MeterBar and StackBar are the two small bars the tiles and tables share.",
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
