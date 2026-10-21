import type { Meta, StoryObj } from "@storybook/react-vite";
import { KairosLogo } from "../Logo/Logo.tsx";
import { SiteFooter } from "./SiteFooter.tsx";

const meta = {
  title: "Components/SiteFooter",
  component: SiteFooter,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The footer of the site pages. It is the dark canvas in both themes: the component nests `data-theme="dark"`, so everything inside reads the dark tokens. Columns for kairos.io, one row (`compact`) for hadron-linux.io.',
      },
    },
  },
  args: {
    brand: (
      <>
        <KairosLogo variant="white" height={32} />
        <span>A Cloud Native Computing Foundation sandbox project.</span>
      </>
    ),
    columns: [
      {
        title: "Products",
        items: ["Console", "Factory", "Installer", "Operator", "Lab", "Hadron"].map((l) => ({
          label: l,
          href: `#${l.toLowerCase()}`,
        })),
      },
      {
        title: "Docs",
        items: ["Quick start", "Start here", "Reference", "Glossary"].map((l) => ({
          label: l,
          href: `#${l.toLowerCase().replace(" ", "-")}`,
        })),
      },
      {
        title: "Community",
        items: ["Slack", "GitHub discussions", "LinkedIn", "Adopters"].map((l) => ({
          label: l,
          href: `#${l.toLowerCase().replace(" ", "-")}`,
        })),
      },
    ],
    legal: "Copyright © 2026 Kairos a Series of LF Projects, LLC",
    note: "Project supported by Spectro Cloud",
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    compact: true,
    columns: [],
    legal: undefined,
    note: undefined,
    brand: (
      <>
        <KairosLogo variant="white" height={36} />
        <span>Engineered by the Kairos team · ships with every Kairos release</span>
      </>
    ),
    children: (
      <div className="flex gap-5 text-sm">
        <a href="#" className="text-sub no-underline hover:text-ink">
          GitHub
        </a>
        <a href="#" className="text-sub no-underline hover:text-ink">
          Docs
        </a>
        <a href="#" className="text-sub no-underline hover:text-ink">
          kairos.io
        </a>
      </div>
    ),
  },
};
