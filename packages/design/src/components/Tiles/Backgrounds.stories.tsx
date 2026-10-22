import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button.tsx";
import { Hero } from "../Hero/Hero.tsx";
import { TileBackground } from "./Tiles.tsx";

const meta = {
  title: "Components/Tiles/Backgrounds",
  component: TileBackground,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`TileBackground` is the tile field with no filled faces: a full-bleed wireframe of Kairos cubes, every cell the three-rhombus outline, so a whole page reads as cubes stacked edge to edge. It fills its positioned parent, is `aria-hidden`, and is quiet enough (the line token on the canvas, with a soft vignette) to sit under copy, which the field itself never may. The `cursor` modes are proposals on top of the deck, off by default: outlines that brighten near the pointer, a faint fill that trails it, or a ring that runs out from a press. All opacity only on a device that can hover with a fine pointer; touch and prefers-reduced-motion get the static plane. Use it on one surface, a landing or a section, not every page.",
      },
    },
  },
  argTypes: {
    cursor: { control: "inline-radio", options: [false, "lines", "fill", "ripple"] },
    highlight: { control: "inline-radio", options: ["accent", "ink"] },
    palette: { control: "inline-radio", options: ["kairos", "hadron"] },
    depth: { control: "boolean" },
    vignette: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    seed: { control: { type: "number", min: 1, max: 99 } },
    radius: { control: { type: "number", min: 24, max: 120, step: 2 } },
    width: { table: { disable: true } },
    height: { table: { disable: true } },
    target: { table: { disable: true } },
  },
  args: {
    cursor: false,
    highlight: "accent",
    palette: "kairos",
    depth: false,
    vignette: 0.6,
    seed: 5,
    radius: 48,
  },
} satisfies Meta<typeof TileBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A full-viewport surface with the plane behind a headline and a button, so the copy's legibility over it is the test. */
function Page({ args, title, lede }: { args: Story["args"]; title: string; lede: string }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-bg">
      <TileBackground {...args} />
      <div className="relative mx-auto flex min-h-screen max-w-(--page-max) flex-col justify-center gap-6 px-8 py-24">
        <span className="font-mono text-xs text-muted">Kairos · CNCF sandbox project</span>
        <h1 className="m-0 max-w-[760px] text-[clamp(40px,6vw,80px)] leading-[0.98] font-semibold tracking-[-0.05em] text-balance">
          {title}
        </h1>
        <p className="m-0 max-w-[560px] text-lg leading-relaxed text-sub text-pretty">{lede}</p>
        <div className="flex flex-wrap gap-2.5 pt-1.5">
          <Button size="lg">Download ISO · x86_64</Button>
          <Button size="lg" variant="outline">
            Read the docs
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Static: Story = {
  name: "Static wireframe",
  parameters: {
    docs: {
      description: {
        story:
          "The plane at rest, as every cursor mode leaves it: the complete grid in the line token, falling off toward the corners, with a little seeded grain. The headline and the buttons sit over it at their full contrast, since the hairlines are a hundredth of the area.",
      },
    },
  },
  render: (args) => (
    <Page
      args={args}
      title="Immutable Linux, built like a container."
      lede="Boot it anywhere, upgrade it everywhere."
    />
  ),
};

export const Lines: Story = {
  name: "Cursor: lines",
  args: { cursor: "lines" },
  parameters: {
    docs: {
      description: {
        story:
          'With `cursor="lines"` the outlines near the pointer brighten in the accent (or the ink, with `highlight="ink"`), falling off over four radii and easing back over the slow duration once the pointer leaves. Pure stroke opacity on a second set of the same outlines; no cube moves or scales. Opt-in, and a proposal on top of the deck.',
      },
    },
  },
  render: (args) => (
    <Page
      args={args}
      title="Bring any Linux. Run it immutable."
      lede="Move the pointer: the cubes around it light up and settle back when it leaves."
    />
  ),
};

export const Fill: Story = {
  name: "Cursor: fill",
  args: { cursor: "fill" },
  parameters: {
    docs: {
      description: {
        story:
          'With `cursor="fill"` the lines light as above and the cube under the pointer takes a faint fill of its three tones, which trails behind the pointer like a wake: the fill comes up over the base duration and fades out over twice the slow one. Opacity only; the faces are the grid\'s own points.',
      },
    },
  },
  render: (args) => (
    <Page
      args={args}
      title="Build an image like a Dockerfile."
      lede="Move the pointer: the cube under it fills and trails behind it as it goes."
    />
  ),
};

export const Ripple: Story = {
  name: "Cursor: ripple",
  args: { cursor: "ripple" },
  parameters: {
    docs: {
      description: {
        story:
          'With `cursor="ripple"` the plane is quiet until a press anywhere on its parent, then one ring of brightness runs out across the outlines from that point, over four times the slow duration to the half-diagonal, and dies away. One shot, opacity only, and never under reduced motion. The press is not consumed: a button over the plane still clicks.',
      },
    },
  },
  render: (args) => (
    <Page
      args={args}
      title="Upgrade it like a container."
      lede="Click anywhere: a ring of light runs out across the plane once."
    />
  ),
};

export const Depth: Story = {
  args: { depth: true, cursor: "lines" },
  parameters: {
    docs: {
      description: {
        story:
          "`depth` steps the outline opacity by row, the lower rows at full strength and the top row at half, so the cubes read as stacked toward the viewer rather than as a flat sheet. Subtle on purpose: it is the same grid, and the cursor modes sit on it unchanged.",
      },
    },
  },
  render: (args) => (
    <Page
      args={args}
      title="From the edge to the datacenter."
      lede="The lower rows are nearer; the plane recedes toward the top."
    />
  ),
};

export const Hadron: Story = {
  name: "Hadron palette",
  args: { palette: "hadron", cursor: "fill" },
  parameters: {
    docs: {
      description: {
        story:
          'Under `data-variant="hadron"` the accent is the Hadron blue, so the lit lines follow it, and `palette="hadron"` paints the wake\'s faces in the blues.',
      },
    },
  },
  render: (args) => (
    <div data-variant="hadron">
      <Page
        args={args}
        title="The foundation for image-based systems."
        lede="A minimal, upstream-aligned Linux built from scratch with musl, systemd and vanilla kernels."
      />
    </div>
  ),
};

export const SiteHero: Story = {
  name: "Site hero",
  args: { cursor: "lines" },
  parameters: {
    docs: {
      description: {
        story:
          "The real `Hero` with its own field off (`tiles={false}`), composed over the plane in a positioned wrapper. The pointer events on the hero bubble to the wrapper, so the plane follows the cursor across the whole section without a `target`.",
      },
    },
  },
  render: (args) => (
    <div className="relative overflow-hidden bg-bg">
      <TileBackground {...args} />
      <Hero
        tiles={false}
        eyebrow="Kairos · CNCF sandbox project"
        title={
          <>
            Bring any Linux.
            <br />
            Run it immutable.
          </>
        }
        lede="Kairos turns Ubuntu, Fedora, Alpine or Hadron into images you build, boot, upgrade and recover the same way on every machine, from the edge to the datacenter."
      >
        <div className="flex flex-wrap gap-2.5 pt-1.5">
          <Button size="lg">Download ISO · x86_64</Button>
          <Button size="lg" variant="outline">
            Choose your path
          </Button>
        </div>
      </Hero>
    </div>
  ),
};
