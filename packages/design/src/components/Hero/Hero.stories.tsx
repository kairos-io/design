import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button.tsx";
import { Hero } from "./Hero.tsx";

const meta = {
  title: "Components/Hero",
  component: Hero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The homepage hero from kairos.io and hadron-linux.io: eyebrow, display headline, lede and actions, with a tile field at the right edge fading towards the copy. The field is decoration and never sits behind text.",
      },
    },
  },
  argTypes: { palette: { control: "inline-radio", options: ["kairos", "hadron"] } },
  args: {
    eyebrow: "Kairos · CNCF sandbox project",
    title: (
      <>
        Bring any Linux.
        <br />
        Run it immutable.
      </>
    ),
    lede: "Kairos turns Ubuntu, Fedora, Alpine or Hadron into images you build, boot, upgrade and recover the same way on every machine, from the edge to the datacenter.",
    palette: "kairos",
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Hero {...args}>
      <div className="flex flex-wrap gap-2.5 pt-1.5">
        <Button size="lg">Download ISO · x86_64</Button>
        <Button size="lg" variant="outline">
          Choose your path
        </Button>
      </div>
    </Hero>
  ),
};

export const Hadron: Story = {
  args: {
    eyebrow: "Hadron v0.5.1 · by Kairos",
    title: "The foundation for image-based systems.",
    lede: "A minimal, upstream-aligned Linux built from scratch with musl, systemd and vanilla kernels. No package manager.",
    palette: "hadron",
    bordered: true,
    tiles: { seed: 7, height: 640 },
  },
  render: (args) => (
    <div data-variant="hadron">
      <Hero {...args}>
        <div className="flex flex-wrap gap-2.5">
          <Button size="lg">Get Hadron with Kairos</Button>
          <Button size="lg" variant="outline">
            Component versions
          </Button>
        </div>
      </Hero>
    </div>
  ),
};

export const NoTiles: Story = {
  args: { tiles: false },
};
