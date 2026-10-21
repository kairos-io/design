import type { Meta, StoryObj } from "@storybook/react-vite";
import { KairosLogo, KairosMark, type LogoVariant } from "./Logo.tsx";

const meta = {
  title: "Components/Logo",
  component: KairosLogo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The Kairos mark and wordmark, inlined from the CNCF artwork (cncf/artwork/projects/kairos) with the paths and fills unchanged. Use the colour rendition on white and on the dark surfaces; white on navy and on photography; black only in print. Keep clear space of one rhombus around it, never recolour, rotate or add effects, and at under 24px use the icon alone. Use of the logo is subject to the Linux Foundation trademark policy.",
      },
    },
  },
  argTypes: {
    layout: { control: "radio", options: ["horizontal", "stacked"] },
    variant: { control: "radio", options: ["color", "white", "black"] },
    height: { control: { type: "number", min: 16, max: 240 } },
    decorative: { control: "boolean" },
  },
  args: { layout: "horizontal", variant: "color", height: 64, decorative: false },
} satisfies Meta<typeof KairosLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const surfaces: { name: string; className: string; variant: LogoVariant }[] = [
  { name: "On the page", className: "bg-bg text-ink", variant: "color" },
  { name: "On navy", className: "bg-side text-ink", variant: "white" },
  { name: "On a card", className: "bg-surface text-ink", variant: "color" },
];

export const AllVariants: Story = {
  name: "Every rendition",
  render: () => (
    <div className="grid gap-4">
      {(["color", "white", "black"] as const).map((variant) => (
        <div
          key={variant}
          className={
            variant === "white"
              ? "grid items-center gap-6 rounded-base bg-side p-6 text-ink sm:grid-cols-[auto_1fr_1fr]"
              : "grid items-center gap-6 rounded-base border bg-surface p-6 text-ink sm:grid-cols-[auto_1fr_1fr]"
          }
        >
          <KairosMark variant={variant} height={64} label={`Kairos icon, ${variant}`} />
          <KairosLogo variant={variant} height={64} label={`Kairos horizontal logo, ${variant}`} />
          <KairosLogo
            variant={variant}
            layout="stacked"
            height={96}
            label={`Kairos stacked logo, ${variant}`}
          />
        </div>
      ))}
    </div>
  ),
};

export const OnSurfaces: Story = {
  name: "Which rendition where",
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      {surfaces.map((s) => (
        <figure
          key={s.name}
          className={`flex flex-col items-center gap-3 rounded-base border p-6 ${s.className}`}
        >
          <KairosLogo variant={s.variant} height={48} />
          <figcaption className="text-xs opacity-70">
            {s.name}: {s.variant}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      <KairosMark height={16} label="Kairos, 16px" />
      <KairosMark height={24} label="Kairos, 24px" />
      <KairosMark height={32} label="Kairos, 32px" />
      <KairosLogo height={28} label="Kairos, top bar size" />
      <KairosLogo height={44} label="Kairos, sidebar size" />
      <KairosLogo layout="stacked" height={96} label="Kairos, stacked" />
    </div>
  ),
};

export const ClearSpace: Story = {
  name: "Clear space",
  render: () => (
    <div className="inline-block rounded-base border border-dashed border-accent p-12">
      <div className="relative">
        <KairosLogo height={64} />
        <span className="absolute -top-10 left-0 text-xs text-muted">
          one rhombus of clear space on every side
        </span>
      </div>
    </div>
  ),
};
