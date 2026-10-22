import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Package } from "lucide-react";
import { Button } from "../Button/Button.tsx";
// The component, not the "Empty state with a field" story below.
import { EmptyState as EmptyStateMessage } from "../EmptyState/EmptyState.tsx";
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
    enter: { control: "inline-radio", options: [false, "drop", "fall", "assemble", "unfold"] },
    idle: { control: "inline-radio", options: [false, "live", "cursor", "wave"] },
    folded: { control: "boolean" },
    animate: { table: { disable: true } },
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
  args: {
    palette: "kairos",
    fade: "right",
    seed: 5,
    radius: 38,
    solid: false,
    enter: false,
    idle: false,
    folded: false,
  },
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
  args: { enter: "drop" },
  parameters: {
    docs: {
      description: {
        story:
          'With `enter="drop"` the filled tiles drop into place once, dense edge first, over about a second. Replay the story to see it again. Under prefers-reduced-motion nothing moves. (`animate="in"` still works as a deprecated alias.)',
      },
    },
  },
  render: (args) => (
    <div className="relative h-80 overflow-hidden rounded-lg border bg-bg">
      <TileField {...args} />
    </div>
  ),
};

const ENTRANCES = ["drop", "fall", "assemble", "unfold"] as const;

/** Every entrance on the same small field, remounted together by Replay, taken away and back by Fold. */
function EntrancesDemo(args: React.ComponentProps<typeof TileField>) {
  const [run, setRun] = React.useState(0);
  const [folded, setFolded] = React.useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setRun((n) => n + 1)}>
          Replay
        </Button>
        <Button variant="outline" onClick={() => setFolded((f) => !f)}>
          {folded ? "Unfold" : "Fold"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {ENTRANCES.map((enter) => (
          <figure key={enter} className="m-0 flex flex-col gap-2">
            <div className="relative h-44 overflow-hidden rounded-lg border bg-bg">
              <TileField
                key={run}
                {...args}
                enter={enter}
                folded={folded}
                radius={64}
                seed={5}
                fade="right"
              />
            </div>
            <figcaption className="font-mono text-xs text-muted">enter="{enter}"</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export const Entrances: Story = {
  name: "Entrances, side by side",
  args: { enter: false },
  parameters: {
    docs: {
      description: {
        story:
          'The family of entrances on one field, to compare: Replay remounts all four together, Fold runs each one in reverse and back. `"drop"` is the deck\'s fade with a short drop. `"fall"` drops each cube from a hexagon height above under gravity and settles it with a 1.5px overshoot. `"assemble"` brings each cube\'s three faces in from their own sides (the top from above, the left from the lower left, the right from the lower right) to snap together at the centre vertex. `"unfold"` hinges each face open from that vertex onto its outline. All stagger from the dense edge, move faces by transform and opacity only, never scale a face beyond its cell, land exactly on the outline over a complete grid, and leave the static field behind. The three beyond `"drop"` are proposals on top of the deck; one is to be picked.',
      },
    },
  },
  render: (args) => <EntrancesDemo {...args} />,
};

export const Fall: Story = {
  name: "Falls into place",
  args: { enter: "fall" },
  parameters: {
    docs: {
      description: {
        story:
          'With `enter="fall"` each cube falls from one hexagon height above its cell, accelerating as it goes, and settles onto its outline with a short overshoot and return, fading in over the first part of the fall. The three faces fall together as one cube. Dense edge first, like the drop. The fall height is `--tile-fall`, set from the radius, so it scales with the tiles. A proposal on top of the deck. Replay the story to see it again; under prefers-reduced-motion the field is simply there.',
      },
    },
  },
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
      </div>
    </section>
  ),
};

export const Unfold: Story = {
  name: "Unfolds into place",
  args: { enter: "unfold" },
  parameters: {
    docs: {
      description: {
        story:
          'With `enter="unfold"` each cube opens from the hexagon\'s centre vertex, the point its three faces share: the top face first, then the left, then the right, a few tens of milliseconds apart, each hinging out along its own edges until it lies exactly on its outline. The grid is complete underneath throughout, so a half-open face always sits over its cell. Dense edge first, like the drop; the resting field is the static one. A proposal on top of the deck, not part of it. Under prefers-reduced-motion the field is simply there.',
      },
    },
  },
  render: (args) => (
    <div className="relative h-80 overflow-hidden rounded-lg border bg-bg">
      <TileField {...args} />
    </div>
  ),
};

/** The Fold story's host: the field is controlled, so something has to own `folded`. */
function FoldDemo(args: React.ComponentProps<typeof TileField>) {
  const [folded, setFolded] = React.useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="outline" onClick={() => setFolded((f) => !f)}>
          {folded ? "Unfold" : "Fold"}
        </Button>
      </div>
      <div className="relative h-80 overflow-hidden rounded-lg border bg-bg">
        <TileField {...args} folded={folded} />
      </div>
    </div>
  );
}

export const Fold: Story = {
  name: "Folds away",
  args: { enter: "fall" },
  parameters: {
    docs: {
      description: {
        story:
          "`folded` is a controlled prop that runs the chosen entrance in reverse. Flip it on and the cubes leave the way they came, the sparse edge first and the dense edge last (a fall falls through, an assembled cube pulls apart, an unfolded one folds into its centre vertex, a drop falls out), until only the outline grid stands; flip it off and they enter again, dense edge first. The grid never changes, so there is always a cell under a face. Use it to clear a hero for a dialog, or to switch a field off while the page behind it does something else. Change `enter` in the controls to compare the exits. A proposal on top of the deck. Under prefers-reduced-motion, or with no entrance, the cubes vanish and return with no motion.",
      },
    },
  },
  render: (args) => <FoldDemo {...args} />,
};

export const Live: Story = {
  name: "Live field",
  args: { enter: "drop", idle: "live" },
  parameters: {
    docs: {
      description: {
        story:
          'With `idle="live"` a few tiles keep breathing on long, uneven cycles once the entrance has landed, so a hero or an empty state feels switched on without pulling the eye. CSS only; no timers. `enter` picks the entrance it follows, or none. (`animate="live"` is the deprecated alias for the drop and the breathing together.)',
      },
    },
  },
  render: (args) => (
    <div className="relative h-80 overflow-hidden rounded-lg border bg-bg">
      <TileField {...args} />
    </div>
  ),
};

export const Cursor: Story = {
  name: "Follows the cursor",
  args: { enter: "drop", idle: "cursor" },
  parameters: {
    docs: {
      description: {
        story:
          'With `idle="cursor"` the tiles follow the pointer once they have entered: move it over the field and the cubes around it light up, empty cells with a faint fill of their tone and filled cubes a shade brighter, fading with distance and settling back over the slow duration once the pointer leaves. The resting field is the static one, and the effect only runs on a device that can hover with a fine pointer; touch and prefers-reduced-motion get the static field. Opt-in, and a proposal on top of the deck rather than part of it: nothing turns it on by default. (`animate="cursor"` is the deprecated alias.)',
      },
    },
  },
  render: (args) => (
    <div className="relative h-80 overflow-hidden rounded-lg border bg-bg">
      <TileField {...args} />
    </div>
  ),
};

export const Wave: Story = {
  name: "Wave across the field",
  args: { enter: "drop", idle: "wave" },
  parameters: {
    docs: {
      description: {
        story:
          'With `idle="wave"` one slow band rolls across the whole field once the entrance has landed, from the dense edge to the sparse one along the fade (right to left here), each cube lifting a pixel and dimming for a moment as it passes, then a gap of a couple of seconds before it comes round again. Where `idle="live"` is a few cubes breathing at random, for a screen merely left open, the wave is the whole field moving together, for a screen that is working: a build running, an install under way. CSS only, opacity and a 1.5px translate, never a scale; the period is the slow duration token times twenty (`--tile-wave-period`), the delays shares of it. A proposal on top of the deck. Under prefers-reduced-motion the field is simply there.',
      },
    },
  },
  render: (args) => (
    <section className="relative overflow-hidden rounded-lg border bg-bg">
      <div className="absolute inset-y-0 right-0 w-[55%]">
        <TileField {...args} fade="right" />
      </div>
      <div className="relative max-w-xl px-10 py-16">
        <TileMarker className="mb-6" tone={2}>
          02
        </TileMarker>
        <h1 className="text-4xl font-bold tracking-tight">Building your image</h1>
        <p className="mt-4 text-lg text-muted">
          The factory is assembling ubuntu-24.04 with k3s v1.31.2 for arm64. This usually takes two to four
          minutes.
        </p>
      </div>
    </section>
  ),
};

export const Working: Story = {
  name: "Working state",
  args: { enter: "drop", idle: "wave" },
  parameters: {
    docs: {
      description: {
        story:
          "The intended use of the wave: a loading or working state in the console, the message set beside the field the way an empty state sets it over the thin edge. The field keeps rolling for as long as the work runs; when it is done, swap the message and turn `idle` off, and the field settles into the static one.",
      },
    },
  },
  render: (args) => (
    <div className="relative overflow-hidden rounded-lg border bg-surface">
      <div className="absolute inset-y-0 right-0 w-1/2">
        <TileField {...args} fade="right" radius={30} seed={9} />
      </div>
      <EmptyStateMessage
        className="relative max-w-md items-start text-left"
        icon={Package}
        title="Building the image…"
        description="kairos-ubuntu-24.04-k3s-v1.31.2-arm64. The artifact appears here when it is ready; you can leave this page."
        action={<Button variant="outline">Cancel build</Button>}
      />
    </div>
  ),
};

export const Hero: Story = {
  name: "Hero with a field",
  args: { enter: "drop" },
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
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
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
    <div data-theme="dark" className="relative h-64 overflow-hidden rounded-lg bg-side text-ink">
      <TileField {...args} fade="right" line="var(--raised)" />
      <div className="relative flex h-full flex-col items-start justify-end gap-3 p-8">
        <TileMarker tone={0}>04</TileMarker>
        <p className="text-3xl font-bold tracking-tight">Section divider</p>
      </div>
    </div>
  ),
};
