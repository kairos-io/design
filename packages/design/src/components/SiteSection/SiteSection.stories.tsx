import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button.tsx";
import { SectionHeading, SiteSection } from "./SiteSection.tsx";

const meta = {
  title: "Components/SiteSection",
  component: SiteSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A band of a site page: full width, content capped at `--page-max` with 32px gutters. Four tones from the homepages: the canvas, a lined strip, the raised adopters band and the deep band, which themes its children dark whatever the page theme. `SectionHeading` is the title row the sections share.",
      },
    },
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["canvas", "lined", "raised", "deep"] },
    padding: { control: "inline-radio", options: ["none", "sm", "base", "lg"] },
  },
  args: { tone: "canvas", padding: "base" },
} satisfies Meta<typeof SiteSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <SiteSection {...args}>
      <SectionHeading
        title="A project for every stage. One platform to run them."
        lede="Each project works on its own. The kairos CLI brings them together in one console."
        action={
          <a href="#" className="text-base font-bold text-link">
            What happened to AuroraBoot? →
          </a>
        }
      />
    </SiteSection>
  ),
};

export const Deep: Story = {
  args: { tone: "deep" },
  render: (args) => (
    <SiteSection {...args}>
      <SectionHeading eyebrow="Start here" title="Pick your path. Go as deep as you need." />
      <div className="mt-8 flex gap-2">
        <Button>Quick start</Button>
        <Button variant="outline">Read the docs</Button>
      </div>
    </SiteSection>
  ),
};

export const Raised: Story = {
  args: { tone: "raised", padding: "sm" },
  render: (args) => (
    <SiteSection {...args} innerClassName="flex flex-wrap items-center justify-between gap-6 py-12">
      <div className="flex flex-col gap-1.5">
        <span className="text-[22px] font-bold">Organizations using Kairos</span>
        <span className="text-[15px] text-sub">Bare metal, edge and distributed infrastructure.</span>
      </div>
      <div className="flex flex-wrap gap-7 text-xl font-bold text-sub">
        <span>CLASTIX</span>
        <span>DeEEP Network</span>
        <span>imec</span>
        <span>Spectro Cloud</span>
      </div>
    </SiteSection>
  ),
};

export const Lined: Story = {
  args: { tone: "lined", padding: "sm" },
  render: (args) => (
    <SiteSection {...args} innerClassName="flex flex-wrap items-center gap-5 py-5">
      <span className="font-mono text-xs text-muted">Bring your own base</span>
      <span className="rounded-base px-3 py-1.5 text-base font-semibold">Ubuntu</span>
      <span className="rounded-base px-3 py-1.5 text-base font-semibold">Fedora</span>
    </SiteSection>
  ),
};
