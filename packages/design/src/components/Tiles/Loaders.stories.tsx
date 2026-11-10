import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card/Card.tsx";
import { KairosMark } from "../Logo/Logo.tsx";
import { StatusDot } from "../StatusDot/StatusDot.tsx";
import { kairosMarkTiles } from "../../lib/mark.ts";
import { TileBar, TileLoader, TileRing, tileRingFrame } from "./Tiles.tsx";

const meta = {
  title: "Components/Tiles/Loaders",
  component: TileLoader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Loading built from the tile motion, where "fold" means coming into place: `TileLoader` is one cube whose faces assemble, rest and come apart, icon-sized, for buttons and rows; `TileBar` with `current` runs that loop on the step in progress and brings each tile into place as it is done; `TileRing` is the Kairos mark itself, its six cubes assembling one by one clockwise from the top, for empty states and first screens. All three keep the outline grid underneath so no cell is ever blank, and all stand still under prefers-reduced-motion. `enter="unfold"` is the default, the system\'s motion, and `"assemble"` the alternative, to compare; `exit="vanish"` makes a cube go in one frame instead of coming apart. Proposals on top of the deck; use one loader per surface, and a plain spinner nowhere.',
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: [16, 20, 24] },
    enter: { control: "inline-radio", options: ["unfold", "assemble"] },
    exit: { control: "inline-radio", options: ["disassemble", "vanish"] },
    tone: { control: "inline-radio", options: ["palette", "mono"] },
    palette: { control: "inline-radio", options: ["kairos", "hadron"] },
    decorative: { control: "boolean" },
  },
  args: {
    size: 20,
    enter: "unfold",
    exit: "disassemble",
    tone: "palette",
    palette: "kairos",
    decorative: false,
  },
} satisfies Meta<typeof TileLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZES = [16, 20, 24] as const;
const ENTRANCES = ["unfold", "assemble"] as const;

export const Loader: Story = {
  render: (args) => (
    <div className="flex items-center gap-3 text-sm">
      <TileLoader {...args} />
      <span className="text-muted">Pulling quay.io/kairos/ubuntu:24.04-core-amd64-generic-v3.5.0</span>
    </div>
  ),
};

/** Every size and both motions side by side; Replay remounts them all so they start together. */
function SizesDemo(args: React.ComponentProps<typeof TileLoader>) {
  const [run, setRun] = React.useState(0);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="outline" onClick={() => setRun((n) => n + 1)}>
          Replay
        </Button>
      </div>
      <div className="grid w-fit grid-cols-[auto_repeat(3,1fr)] items-center gap-x-10 gap-y-4 text-sm">
        <span />
        {SIZES.map((size) => (
          <span key={size} className="font-mono text-xs text-muted">
            {size}px
          </span>
        ))}
        {ENTRANCES.map((enter) => (
          <React.Fragment key={enter}>
            <span className="font-mono text-xs text-muted">enter="{enter}"</span>
            {SIZES.map((size) => (
              <TileLoader key={`${size}:${run}`} {...args} size={size} enter={enter} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export const Sizes: Story = {
  name: "Sizes and motions",
  parameters: {
    docs: {
      description: {
        story:
          'The three icon sizes down the columns and the two motions down the rows: `"unfold"` hinges each face open from the cube\'s centre vertex along its own edges, `"assemble"` brings each in along the line from that vertex through its middle. The faces go in tone order an eighth of a turn apart, rest as the complete cube, leave the same way, and the last is still leaving as the first returns. Unfold is the default, the system\'s motion; assemble is the alternative. The `exit` control switches both rows to the vanish.',
      },
    },
  },
  render: (args) => <SizesDemo {...args} />,
};

export const Mono: Story = {
  name: "Mono, on a fill",
  args: { tone: "mono" },
  parameters: {
    docs: {
      description: {
        story:
          '`tone="mono"` paints the three faces in `currentColor` at three strengths, lightest on top like the palette, so the cube keeps its tones on the accent, on ink, or on any fill the oranges would not read on. The outline beneath is the same colour, fainter.',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-3 rounded-base bg-accent px-4 py-3 text-sm font-bold text-on-accent">
        <TileLoader {...args} />
        Building artifact
      </div>
      <div className="flex items-center gap-3 rounded-base bg-ink px-4 py-3 text-sm font-semibold text-bg">
        <TileLoader {...args} />
        Pushing to registry
      </div>
      <div className="flex items-center gap-3 rounded-base bg-surface px-4 py-3 text-sm text-muted">
        <TileLoader {...args} />
        Waiting for edge-rack2-03
      </div>
    </div>
  ),
};

/** A row of buttons that can be switched between idle and loading, to see that nothing beside them moves. */
function ButtonsDemo() {
  const [loading, setLoading] = React.useState(true);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="outline" size="sm" onClick={() => setLoading((v) => !v)}>
          {loading ? "Stop loading" : "Start loading"}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button loading={loading}>Download ISO</Button>
        <Button loading={loading} variant="dark">
          Build
        </Button>
        <Button loading={loading} variant="outline">
          Register node
        </Button>
        <Button loading={loading} variant="ghost">
          Refresh
        </Button>
        <Button loading={loading} variant="destructive">
          Reset node
        </Button>
        <Button loading={loading} size="sm" variant="outline">
          Retry
        </Button>
        <Button variant="ghost">Cancel</Button>
      </div>
    </div>
  );
}

export const ButtonLoading: Story = {
  name: "Button, loading",
  parameters: {
    docs: {
      description: {
        story:
          "`Button loading` shows the loader at 16px over its label: the mono rendition in the button's own ink on the filled variants, the palette on the outline, ghost and link buttons. The label goes transparent but keeps its place and its name, so the button is exactly as wide loading as idle and the Cancel beside it never moves. The button is disabled and `aria-busy` while it loads, so the loader itself is decorative.",
      },
    },
  },
  render: () => <ButtonsDemo />,
};

const INSTALL_STEPS = [
  "Partition disk",
  "Copy image",
  "Install bootloader",
  "Write cloud-config",
  "Enroll keys",
  "First boot",
  "Join cluster",
  "Verify node",
];

/** A stepping bar: Next step marks the running step done and starts the next one. */
function StepsDemo({ enter, exit }: { enter: "assemble" | "unfold"; exit: "disassemble" | "vanish" }) {
  const [done, setDone] = React.useState(2);
  const running = done < INSTALL_STEPS.length;
  return (
    <div className="flex max-w-md flex-col gap-3">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Installing edge-rack2-03</span>
        <span className="text-muted">
          {running ? `step ${done + 1} of ${INSTALL_STEPS.length}` : "installed"}
        </span>
      </div>
      <TileBar
        total={INSTALL_STEPS.length}
        done={done}
        current={running}
        enter={enter}
        exit={exit}
        size={24}
        aria-label="Install progress"
      />
      <p className="m-0 flex items-center gap-2 text-sm text-muted">
        {running ? (
          <>
            <TileLoader size={16} enter={enter} exit={exit} decorative />
            {INSTALL_STEPS[done]}
          </>
        ) : (
          "Node installed and joined."
        )}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!running} onClick={() => setDone((n) => n + 1)}>
          Next step
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDone(0)}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export const BarCurrent: Story = {
  name: "Bar with a current step",
  parameters: {
    docs: {
      description: {
        story:
          "`TileBar` with `current` runs the loader's motion on the tile at index `done`, the step in progress, while the done tiles stand and the rest wait as outlines. Press Next step: the running tile comes into place as done and the next one starts looping; the tiles that were already done do not move. Reset drops it back to the start with no motion, since only a tile that becomes done moves. `enter` picks unfold (default) or assemble for the bar and the inline loader beside it, `exit` how the running tile leaves between loops.",
      },
    },
  },
  render: (args) => <StepsDemo enter={args.enter ?? "unfold"} exit={args.exit ?? "disassemble"} />,
};

export const BarIndeterminate: Story = {
  name: "Bar, indeterminate",
  parameters: {
    docs: {
      description: {
        story:
          "With `current` and no `done`, nothing is known but that work is going on: the loop travels the bar as a wave, each tile an eighth of a turn behind its neighbour, so a band of lit tiles sweeps left to right and repeats every eight tiles. The progressbar has no value until `done` arrives.",
      },
    },
  },
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Rollout to edge-rack2</span>
          <span className="text-muted">waiting for the first node</span>
        </div>
        <TileBar total={40} current aria-label="Rollout to edge-rack2" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Build artifact</span>
          <span className="text-muted">queued</span>
        </div>
        <TileBar total={8} current size={24} palette="hadron" aria-label="Build progress" />
      </div>
    </div>
  ),
};

const RINGS = [
  [48, "build"],
  [64, "build"],
  [96, "chase"],
  [120, "build"],
] as const;

export const Ring: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`TileRing` is the Kairos mark: its six cubes on the icon\'s own geometry (the mark turns some of them, so the same tone meets itself across a few neighbours, and the ring does too), 48 to 120px; the Kairos oranges here, `palette="hadron"` in the control for the blues. `mode="build"` (default) brings the cubes in one by one clockwise from the top, rests as the complete mark for a beat, takes them away in the same order and starts again, the first returning while the last is still going. `mode="chase"` builds the ring once and from then on one cube at a time goes and comes straight back, chasing round. Each cube assembles fully, its three faces at the inline loader\'s timing, before the next starts, so one cube moves at a time (two in the chase, one going as one returns). `enter` picks unfold or assemble, `exit` whether a cube comes apart or vanishes. For an empty state or a first screen that waits on something, one per surface.',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-end gap-10">
      {RINGS.map(([size, mode]) => (
        <figure key={`${size}${mode}`} className="m-0 flex flex-col items-center gap-2">
          <TileRing size={size} mode={mode} palette={args.palette} enter={args.enter} exit={args.exit} />
          <figcaption className="font-mono text-xs text-muted">
            {size}, {mode}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};

/** The ring at rest over the real mark: any mismatch would show as a doubled edge. */
function OverlayDemo({ enter }: { enter: "assemble" | "unfold" }) {
  const size = 120;
  const frame = tileRingFrame(size);
  const mark = kairosMarkTiles();
  return (
    <div className="flex flex-wrap items-start gap-12">
      <figure className="m-0 flex flex-col items-center gap-2">
        <div className="relative" style={{ width: frame.width, height: frame.height }}>
          <KairosMark
            decorative
            height={mark.viewBox.height * frame.scale}
            className="absolute"
            style={{ left: frame.offset[0], top: frame.offset[1] }}
          />
          <TileRing size={size} enter={enter} className="absolute top-0 left-0 opacity-50" />
        </div>
        <figcaption className="font-mono text-xs text-muted">ring at 50% over KairosMark</figcaption>
      </figure>
      <figure className="m-0 flex flex-col items-center gap-2">
        <KairosMark height={mark.viewBox.height * frame.scale} />
        <figcaption className="font-mono text-xs text-muted">KairosMark</figcaption>
      </figure>
      <figure className="m-0 flex flex-col items-center gap-2">
        <TileRing size={size} enter={enter} />
        <figcaption className="font-mono text-xs text-muted">TileRing size={size}</figcaption>
      </figure>
    </div>
  );
}

export const RingOverlay: Story = {
  name: "Ring over the mark",
  parameters: {
    docs: {
      description: {
        story:
          "The ring at 50% opacity over the real `KairosMark` at the same scale, then the two side by side. The ring's eighteen rhombi are the icon's own rects through their matrices (`kairosMarkTiles` in `src/lib/mark.ts`), so at rest the two coincide to the point; the ring adds the hairline outlines underneath. `tileRingFrame(size)` gives the scale and offset that place the icon under the ring.",
      },
    },
  },
  render: (args) => <OverlayDemo enter={args.enter ?? "unfold"} />,
};

export const RingEmptyState: Story = {
  name: "Ring in an empty state",
  render: () => (
    <div className="flex flex-col items-center gap-3 rounded-base border bg-surface px-4 py-12 text-center">
      <TileRing size={96} aria-label="Building the artifact" />
      <p className="m-0 font-semibold text-ink">Building kairos-ubuntu-24.04-v3.5.0.iso</p>
      <p className="m-0 max-w-sm text-sm text-sub">
        The factory is assembling the image. It takes about four minutes; the download appears here when it is
        ready.
      </p>
      <div className="mt-2">
        <Button variant="outline">View build log</Button>
      </div>
    </div>
  ),
};

/** A loader that can be told it has finished: the loop lands in the status tones. */
function SucceedsDemo({ enter, exit }: { enter: "assemble" | "unfold"; exit: "disassemble" | "vanish" }) {
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");
  const [settled, setSettled] = React.useState<string | null>(null);
  const flip = (next: typeof status) => {
    setSettled(null);
    setStatus(next);
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => flip("loading")}>
          Loading
        </Button>
        <Button variant="outline" size="sm" onClick={() => flip("success")}>
          Succeed
        </Button>
        <Button variant="outline" size="sm" onClick={() => flip("error")}>
          Fail
        </Button>
        <span className="self-center font-mono text-xs text-muted">
          {settled ? `onSettled("${settled}")` : "\u00a0"}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-10">
        <div className="flex items-center gap-3 text-sm">
          <TileLoader size={24} enter={enter} exit={exit} status={status} onSettled={setSettled} />
          <span className="text-muted">Pulling image</span>
        </div>
        <TileBar
          total={8}
          done={5}
          current
          enter={enter}
          exit={exit}
          status={status}
          size={20}
          aria-label="Install progress"
        />
        <TileRing size={96} enter={enter} exit={exit} status={status} />
      </div>
    </div>
  );
}

export const Succeeds: Story = {
  name: "Succeeds, or fails",
  parameters: {
    docs: {
      description: {
        story:
          '`status="success"` on any of the three stops the loop in the same frame and resolves what is on screen in one quick pass: a face already on its outline crossfades to the three success greens over the fast token, a face on its way or away completes to its outline from wherever it is over the base token (a transition on the same transform and opacity, so nothing jumps back to the start of a keyframe) and turns green as it lands, the faces a step apart in tone and ring order, so the cube, the bar and the ring are green and still within about a third of a second, and never loop while the status stays. `onSettled("success")` fires once the last face has turned, and the accessible name goes from "Loading" to "Done", announced politely. `"error"` is the same in the recovery reds, "Failed". Press Succeed or Fail at any point of the loop to see it. Under prefers-reduced-motion the tiles simply turn. Back to `"loading"` and the loop starts again from empty.',
      },
    },
  },
  render: (args) => <SucceedsDemo enter={args.enter ?? "unfold"} exit={args.exit ?? "disassemble"} />,
};

const EXITS = ["disassemble", "vanish"] as const;

/** The two exits side by side on all three loaders; Replay remounts them so they start together. */
function VanishesDemo({ enter }: { enter: "assemble" | "unfold" }) {
  const [run, setRun] = React.useState(0);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="outline" onClick={() => setRun((n) => n + 1)}>
          Replay
        </Button>
      </div>
      <div className="grid w-fit grid-cols-[auto_auto_auto_auto] items-center gap-x-10 gap-y-6 text-sm">
        {EXITS.map((exit) => (
          <React.Fragment key={`${exit}:${run}`}>
            <span className="font-mono text-xs text-muted">exit="{exit}"</span>
            <div className="flex items-center gap-3">
              <TileLoader size={24} enter={enter} exit={exit} />
              <span className="text-muted">Pulling image</span>
            </div>
            <TileBar
              total={8}
              done={5}
              current
              enter={enter}
              exit={exit}
              size={20}
              aria-label="Install progress"
            />
            <div className="flex items-end gap-6">
              <TileRing size={64} enter={enter} exit={exit} />
              <TileRing size={64} mode="chase" enter={enter} exit={exit} />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export const Vanishes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The default exit over the vanish, to compare. With `exit="vanish"` the faces come in as before and rest as the complete cube, then are gone in one frame: no motion, no fade, the outline still there, and after one entrance the cube comes in again. The bar\'s running tile does the same on its rest tile. The ring in `mode="build"` builds the whole mark, rests one cube\'s time, and all six go together; in `mode="chase"` one cube at a time comes in round the ring, each gone as the next begins, so no mark stands. The same keyframes are the entrance with an exit of zero length (`.tile-*-vanish` and the `.tile-*-gate` groups in `base.css`); under prefers-reduced-motion both exits are the static cube, tile or mark. `enter` in the controls switches the motion.',
      },
    },
  },
  render: (args) => <VanishesDemo enter={args.enter ?? "unfold"} />,
};

const NODE_STAGES = [
  "Partition",
  "Copy image",
  "Bootloader",
  "Cloud-config",
  "Enroll keys",
  "First boot",
  "Join",
];
const BUILD_STAGES = ["Resolve", "Pull base", "Layer", "Kernel", "Sign", "Push"];
const UBUNTU = "quay.io/kairos/ubuntu:24.04-core-amd64-generic-v3.5.0";

type Job = {
  name: string;
  image: string;
  stages: string[];
  done?: number;
  state: "running" | "pulling" | "waiting" | "done" | "failed" | "succeeded";
};

const JOBS: Job[] = [
  { name: "edge-rack2-01", image: UBUNTU, stages: NODE_STAGES, done: 2, state: "running" },
  { name: "edge-rack2-02", image: UBUNTU, stages: NODE_STAGES, done: 1, state: "pulling" },
  {
    name: "ubuntu-24.04-standard",
    image: "quay.io/kairos/ubuntu:24.04-standard-amd64-generic-v3.5.0",
    stages: BUILD_STAGES,
    state: "waiting",
  },
  { name: "edge-rack2-03", image: UBUNTU, stages: NODE_STAGES, done: 0, state: "running" },
  { name: "edge-rack2-04", image: UBUNTU, stages: NODE_STAGES, done: 7, state: "succeeded" },
  {
    name: "alpine-3.21-core",
    image: "quay.io/kairos/alpine:3.21-core-arm64-rpi4-v3.5.0",
    stages: BUILD_STAGES,
    done: 6,
    state: "succeeded",
  },
  { name: "edge-rack2-05", image: UBUNTU, stages: NODE_STAGES, done: 4, state: "failed" },
  { name: "edge-rack2-06", image: UBUNTU, stages: NODE_STAGES, done: 5, state: "running" },
  {
    name: "fedora-41-core",
    image: "quay.io/kairos/fedora:41-core-amd64-generic-v3.5.0",
    stages: BUILD_STAGES,
    done: 1,
    state: "running",
  },
];

function JobCard({ job }: { job: Job }) {
  const total = job.stages.length;
  const busy = job.state === "running" || job.state === "pulling";
  const finished = job.state === "done" || job.state === "succeeded";
  const status =
    job.state === "waiting"
      ? "Waiting on the registry"
      : finished
        ? "Complete"
        : job.state === "failed"
          ? `Failed: ${job.stages[job.done ?? 0]}`
          : job.state === "pulling"
            ? "Pulling image"
            : job.stages[job.done ?? 0];
  return (
    <Card bordered>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{job.name}</CardTitle>
        <CardDescription className="truncate font-mono text-xs">{job.image}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <TileBar
          total={total}
          done={job.state === "waiting" ? undefined : job.done}
          current={job.state === "waiting" || busy}
          status={job.state === "succeeded" ? "success" : job.state === "failed" ? "error" : "loading"}
          aria-label={`${job.name} stages`}
        />
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2 text-muted">
            {job.state === "pulling" ? (
              <TileLoader size={16} decorative />
            ) : (
              <StatusDot
                tone={finished ? "success" : job.state === "failed" ? "danger" : "info"}
                outline={!finished && job.state !== "failed"}
              />
            )}
            <span className={job.state === "failed" ? "font-medium text-status-recovery" : undefined}>
              {status}
            </span>
          </span>
          <span className="font-mono text-xs text-muted">
            {job.state === "waiting" ? "queued" : `${Math.min(job.done ?? 0, total)}/${total}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export const BuildQueue: Story = {
  name: "Build queue",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          'Nine jobs at once, the realistic use: nodes installing and factory builds, each with its stage bar. Several are mid-way with the current tile assembling, one is pulling its image (the inline loader beside the status), one waits on the registry (indeterminate), one has just started, two have succeeded (`status="success"`: every tile landed green, nothing moving), and one failed on a step (`status="error"`: its tiles in the recovery reds, the status diamond in the danger tone, no loop). Each running bar is one CSS animation on one polygon, so nine of them cost the page nothing.',
      },
    },
  },
  render: () => (
    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {JOBS.map((job) => (
        <JobCard key={job.name} job={job} />
      ))}
    </div>
  ),
};
