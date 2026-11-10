import type { Meta, StoryObj } from "@storybook/react-vite";
import { HadronLogo, HadronMark, KairosLogo, KairosMark } from "./Logo.tsx";

const meta = {
  title: "Components/Logo",
  component: KairosLogo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The Kairos and Hadron marks and lockups, inlined with the shapes and fills unchanged. The marks do not change: pick the rendition by the surface (colour on light surfaces, the dark lockup on dark surfaces, white on a flat fill or photography, black for one-colour print), never recolour, and never place a mark on an orange or blue fill or over a tile field. Keep one mark-height of clear space around the horizontal logo and 24px as the minimum height on screen. Kairos is a CNCF project and its name and logos are trademarks of The Linux Foundation; Hadron is a separate Linux distribution with its own name and logo, maintained by the Kairos team.",
      },
    },
  },
  argTypes: {
    layout: { control: "radio", options: ["horizontal", "stacked"] },
    variant: { control: "radio", options: ["color", "dark", "white", "black"] },
    height: { control: { type: "number", min: 16, max: 240 } },
    decorative: { control: "boolean" },
  },
  args: { layout: "horizontal", variant: "color", height: 64, decorative: false },
} satisfies Meta<typeof KairosLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Kairos: Story = {
  name: "Kairos: every rendition",
  render: () => (
    <div className="grid gap-4">
      <div className="grid items-center gap-6 rounded-base border bg-surface p-6 text-ink sm:grid-cols-[auto_1fr_1fr]">
        <KairosMark height={64} label="Kairos mark, colour" />
        <KairosLogo height={64} label="Kairos horizontal logo, colour" />
        <KairosLogo layout="stacked" height={96} label="Kairos stacked logo, colour" />
      </div>
      <div
        className="grid items-center gap-6 rounded-base p-6 sm:grid-cols-[auto_1fr_1fr]"
        data-theme="dark"
        style={{ background: "var(--bg)", color: "var(--ink)" }}
      >
        <KairosMark variant="dark" height={64} label="Kairos mark on a dark surface" />
        <KairosLogo variant="dark" height={64} label="Kairos horizontal logo, dark surface" />
        <KairosLogo variant="white" layout="stacked" height={96} label="Kairos stacked logo, white" />
      </div>
      <div className="grid items-center gap-6 rounded-base bg-ink p-6 text-bg sm:grid-cols-[auto_1fr_1fr]">
        <KairosMark variant="white" height={64} label="Kairos mark, white" />
        <KairosLogo variant="white" height={64} label="Kairos horizontal logo, white" />
        <KairosLogo variant="white" layout="stacked" height={96} label="Kairos stacked logo, white" />
      </div>
      <div className="grid items-center gap-6 rounded-base border bg-surface p-6 text-ink sm:grid-cols-[auto_1fr_1fr]">
        <KairosMark variant="black" height={64} label="Kairos mark, black" />
        <KairosLogo variant="black" height={64} label="Kairos horizontal logo, black" />
        <KairosLogo variant="black" layout="stacked" height={96} label="Kairos stacked logo, black" />
      </div>
    </div>
  ),
};

export const Hadron: Story = {
  name: "Hadron: every rendition",
  render: () => (
    <div className="grid gap-4">
      <div className="grid items-center gap-6 rounded-base border bg-surface p-6 text-ink sm:grid-cols-[auto_1fr]">
        <HadronMark height={64} label="Hadron mark, colour" />
        <HadronLogo height={64} label="Hadron horizontal logo, light surface" />
      </div>
      <div
        className="grid items-center gap-6 rounded-base p-6 sm:grid-cols-[auto_1fr]"
        data-theme="dark"
        style={{ background: "var(--bg)", color: "var(--ink)" }}
      >
        <HadronMark height={64} label="Hadron mark on a dark surface" />
        <HadronLogo variant="dark" height={64} label="Hadron horizontal logo, dark surface" />
      </div>
      <div className="grid items-center gap-6 rounded-base bg-ink p-6 text-bg sm:grid-cols-[auto_1fr]">
        <HadronMark variant="white" height={64} label="Hadron mark, white" />
        <span className="text-sm opacity-70">
          The lockup has no one-colour rendition; use the mark alone.
        </span>
      </div>
    </div>
  ),
};

export const Together: Story = {
  name: "Kairos and Hadron together",
  render: () => (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-8 rounded-base border bg-surface p-6 text-ink">
        <KairosLogo height={36} />
        <span className="text-muted" aria-hidden="true">
          ·
        </span>
        <HadronLogo height={36} />
      </div>
      <div className="flex flex-wrap items-center gap-6 rounded-base border bg-surface p-6 text-ink">
        <span className="inline-flex items-center gap-2 text-lg">
          <KairosMark height={20} decorative />
          Kairos <b className="font-bold">Installer</b>
        </span>
        <span className="inline-flex items-center gap-2 text-lg">
          <KairosMark height={20} decorative />
          <b className="font-bold">Kairos</b>
        </span>
        <span className="inline-flex items-center gap-2 text-lg">
          <HadronMark height={20} decorative />
          <b className="font-bold">Hadron</b>
        </span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      <KairosMark height={16} label="Kairos, 16px favicon size" />
      <KairosMark height={24} label="Kairos, 24px minimum" />
      <KairosMark height={32} label="Kairos, 32px" />
      <KairosLogo height={24} label="Kairos lockup at the 24px minimum" />
      <KairosLogo height={36} label="Kairos, top bar size" />
      <HadronMark height={24} label="Hadron, 24px minimum" />
      <HadronLogo height={36} label="Hadron, top bar size" />
    </div>
  ),
};

export const ClearSpace: Story = {
  name: "Clear space",
  render: () => (
    <div className="flex flex-wrap gap-6">
      <div className="inline-block rounded-base border border-dashed border-accent p-16">
        <KairosLogo height={64} />
      </div>
      <div className="inline-block rounded-base border border-dashed border-hadron-blue p-16">
        <HadronLogo height={64} />
      </div>
      <p className="max-w-xs self-center text-sm text-muted">
        One mark-height of clear space around the horizontal logo, on every side.
      </p>
    </div>
  ),
};
