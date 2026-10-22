import type { Meta, StoryObj } from "@storybook/react-vite";
import { Gauge, Sparkline, TileMeter } from "./Gauge.tsx";

const meta = {
  title: "Components/Gauge",
  component: Gauge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The live meters of the node detail deck. `Gauge` is a 270° arc of thirty tile segments in the three oranges with the reading in the middle; above 70% every lit segment turns amber, above 85% red. `Sparkline` is the trend under it. `TileMeter` is the disk meter: a row of tiles filled from the left with the same thresholds. All three read their colours from the tokens, so they follow the theme and the Hadron variant leaves them orange, as the decks do.",
      },
    },
  },
  args: { value: 38, label: "CPU", sub: "CPU" },
} satisfies Meta<typeof Gauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Thresholds: Story = {
  name: "Under 70, 70 to 85, over 85",
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Gauge value={38} label="CPU" />
      <Gauge value={74} label="CPU" />
      <Gauge value={91} label="CPU" />
      <Gauge value={54} unit="°" label="Temperature" sub="temperature" />
    </div>
  ),
};

export const Trend: Story = {
  name: "Sparkline",
  render: () => (
    <div className="grid max-w-sm gap-3">
      <Sparkline
        values={Array.from({ length: 30 }, (_, i) => 36 + Math.sin(i * 0.7) * 9)}
        aria-label="CPU over the last minute"
      />
      <Sparkline
        values={Array.from({ length: 30 }, (_, i) => (i < 20 ? 40 + Math.sin(i) * 8 : 88 + Math.sin(i) * 4))}
        tone="danger"
      />
    </div>
  ),
};

export const Disks: Story = {
  name: "TileMeter",
  render: () => (
    <div className="grid max-w-sm gap-3">
      {[
        { label: "Persistent", used: "182 GB", total: "420 GB", p: 43 },
        { label: "State (A/B)", used: "2.4 GB", total: "8 GB", p: 30 },
        { label: "OEM", used: "58 MB", total: "64 MB", p: 91 },
      ].map((d) => (
        <div key={d.label} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{d.label}</span>
            <span className="font-mono text-xs text-muted">
              {d.used} / {d.total}
            </span>
          </div>
          <TileMeter value={d.p} aria-label={`${d.label} partition`} valueText={`${d.used} of ${d.total}`} />
        </div>
      ))}
    </div>
  ),
};
