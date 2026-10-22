import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button.tsx";
import { KairosLogo } from "../Logo/Logo.tsx";
import { SiteHeader } from "./SiteHeader.tsx";

const meta = {
  title: "Components/SiteHeader",
  component: SiteHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The header of the site pages: logo, primary links and actions on one row. The current page is underlined in the accent line, as the docs navbar draws it. Not the console's top bar: that is `Sidebar`'s shell.",
      },
    },
  },
  args: {
    logo: (
      <a href="#" aria-label="Kairos home">
        <KairosLogo decorative height={34} />
      </a>
    ),
    links: [
      { label: "Products", href: "#products" },
      { label: "Start here", href: "#start" },
      { label: "Docs", href: "#docs" },
      { label: "Blog", href: "#blog" },
      { label: "Community", href: "#community" },
    ],
    actions: (
      <>
        <a
          href="#"
          className="rounded-base border border-line px-2.5 py-[7px] font-mono text-xs text-muted no-underline"
        >
          ★ GitHub
        </a>
        <Button variant="dark">Quick start</Button>
      </>
    ),
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Docs: Story = {
  args: {
    bordered: true,
    links: [
      { label: "Docs", href: "#docs", current: true },
      { label: "Start here", href: "#start" },
      { label: "Reference", href: "#reference" },
      { label: "Blog", href: "#blog" },
    ],
  },
};
