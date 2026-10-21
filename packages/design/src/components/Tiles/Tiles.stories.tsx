import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button.tsx";
import { Tile, TileBar, TileField, TileMarker, TileUnit } from "./Tiles.tsx";

const meta = {
  title: "Components/Tiles",
  component: TileField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The Kairos tiles: the mark's rhombi laid flat. `TileField` is a decorative background for heroes and empty states, dense at one edge and fading to outlines, never behind text. `TileUnit` is the single hexagon, `Tile` one parallelogram, `TileBar` one tile per node or step, and `TileMarker` a numbered tile for stages and agenda items.",
      },
    },
  },
  argTypes: {
    animate: { control: "inline-radio", options: [false, "in", "live"] },
    palette: { control: "inline-radio", options: ["kairos", "hadron"] },
    fade: {
      control: "select",
      options: ["right", "left", "top", "bottom", "topRight", "bottomRight", "center", "ramp"],
    },
    seed: { control: { type: "number", min: 1, max: 99 } },
    radius: { control: { type: "number", min: 16, max: 120, step: 2 } },
    solid: { control: "boolean" },
    width: { table: { disable: true } },
    height: { table: { disable: true } },
  },
  args: { palette: "kairos", fade: "right", seed: 5, radius: 38, solid: false, animate: false },
} satisfies Meta<typeof TileField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Field: Story = {
  render: (args) => (
    <div className="relative h-80 overflow-hidden rounded-lg border bg-bg">
      <TileField {...args} />
    </div>
  ),
};

export const Animated: Story = {
  name: "Tiles into place",
  args: { animate: "in" },
  parameters: {
    docs: {
      description: {
        story:
          'With `animate="in"` the filled tiles drop into place once, dense edge first, over about a second. Replay the story to see it again. Under prefers-reduced-motion nothing moves.',
      },
    },
  },
  render: (args) => (
    <div className="relative h-80 overflow-hidden rounded-lg border bg-bg">
      <TileField {...args} />
    </div>
  ),
};

export const Live: Story = {
  name: "Live field",
  args: { animate: "live" },
  parameters: {
    docs: {
      description: {
        story:
          'With `animate="live"` the tiles enter the same way and then a few keep breathing on long, uneven cycles, so a hero or an empty state feels switched on without pulling the eye. CSS only; no timers.',
      },
    },
  },
  render: (args) => (
    <div className="relative h-80 overflow-hidden rounded-lg border bg-bg">
      <TileField {...args} />
    </div>
  ),
};

export const Hero: Story = {
  name: "Hero with a field",
  args: { animate: "in" },
  render: (args) => (
    <section className="relative overflow-hidden rounded-lg border bg-bg">
      <div className="absolute inset-y-0 right-0 w-[55%]">
        <TileField {...args} fade="right" />
      </div>
      <div className="relative max-w-xl px-10 py-16">
        <TileMarker className="mb-6" tone={2}>
          01
        </TileMarker>
        <h1 className="text-4xl font-bold tracking-tight">Immutable Kubernetes at the edge</h1>
        <p className="mt-4 text-lg text-muted">
          Build a bootable image from a Dockerfile, deploy it to any device and upgrade it like a container.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg">Get started</Button>
          <Button size="lg" variant="outline">
            Read the docs
          </Button>
        </div>
      </div>
    </section>
  ),
};

export const EmptyState: Story = {
  name: "Empty state with a field",
  render: (args) => (
    <div className="relative overflow-hidden rounded-lg border bg-surface">
      <TileField {...args} fade="topRight" radius={30} seed={9} className="opacity-70" />
      <div className="relative flex flex-col items-start gap-3 p-10">
        <TileUnit size={40} />
        <p className="text-lg font-semibold">No nodes yet</p>
        <p className="max-w-sm text-sm text-muted">
          Register a machine with the token below, or boot one from an artifact and it will appear here.
        </p>
        <Button className="mt-2">Register a node</Button>
      </div>
    </div>
  ),
};

export const Unit: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <TileUnit size={32} />
      <TileUnit size={64} />
      <TileUnit size={120} />
    </div>
  ),
};

export const Tiles: Story = {
  name: "Single tiles",
  render: () => (
    <div className="flex items-center gap-3">
      <Tile tone={0} size={44} />
      <Tile tone={1} size={44} />
      <Tile tone={2} size={44} />
      <Tile tone="rest" size={44} />
    </div>
  ),
};

export const Bar: Story = {
  name: "Tile bar",
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Rollout to edge-rack2</span>
          <span className="text-muted">33 of 40 nodes</span>
        </div>
        <TileBar total={40} done={33} aria-label="Rollout to edge-rack2" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Install</span>
          <span className="text-muted">step 3 of 8</span>
        </div>
        <TileBar total={8} done={3} size={24} aria-label="Install progress" />
      </div>
    </div>
  ),
};

export const Marker: Story = {
  name: "Tile marker",
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <TileMarker size="sm">01</TileMarker>
        <TileMarker>02</TileMarker>
        <TileMarker size="lg">03</TileMarker>
      </div>
      <div className="flex items-center gap-3">
        <TileMarker tone={0}>01</TileMarker>
        <TileMarker tone={1}>02</TileMarker>
        <TileMarker tone={2}>03</TileMarker>
      </div>
      <ol className="flex flex-col gap-3">
        {["Why immutable", "Build an image", "Deploy to the edge", "Upgrade and roll back"].map((t, i) => (
          <li key={t} className="flex items-center gap-4">
            <TileMarker>{String(i + 1).padStart(2, "0")}</TileMarker>
            <span className="text-xl font-semibold tracking-tight">{t}</span>
          </li>
        ))}
      </ol>
    </div>
  ),
};

export const Hadron: Story = {
  name: "Hadron palette",
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="relative h-56 overflow-hidden rounded-lg border bg-bg">
        <TileField {...args} palette="hadron" seed={7} />
      </div>
      <div className="flex items-center gap-6">
        <TileUnit size={64} palette="hadron" />
        <TileBar total={12} done={8} size={20} palette="hadron" aria-label="Hadron rollout" />
        <TileMarker palette="hadron" tone={0}>
          01
        </TileMarker>
        <TileMarker palette="hadron" tone={1}>
          02
        </TileMarker>
        <TileMarker palette="hadron">03</TileMarker>
      </div>
    </div>
  ),
};

export const Dark: Story = {
  name: "On the navy surface",
  render: (args) => (
    <div className="relative h-64 overflow-hidden rounded-lg bg-side">
      <TileField {...args} fade="right" line="var(--raised)" />
      <div className="relative flex h-full flex-col items-start justify-end gap-3 p-8 text-bg">
        <TileMarker tone={0}>04</TileMarker>
        <p className="text-3xl font-bold tracking-tight">Section divider</p>
      </div>
    </div>
  ),
};
