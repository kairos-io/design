import type { Meta, StoryObj } from "@storybook/react-vite";
import { DocsNav, DocsToc } from "./DocsNav.tsx";

const meta = {
  title: "Components/DocsNav",
  component: DocsNav,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The docs site's left navigation and its \"On this page\" column, from the Docs product page deck. The current page sits on a surface with the accent tile; everything else is indented in the sub ink. Not the console's `Sidebar`.",
      },
    },
  },
  args: {
    groups: [
      { title: "Start here", items: ["Quick start", "Choose your path", "Glossary"].map((l) => ({ label: l, href: `#${l}` })) },
      {
        title: "Products",
        items: ["Factory", "Console", "Installer", "Operator", "Lab"].map((l) => ({
          label: l,
          href: `#${l}`,
          current: l === "Console",
        })),
      },
      { title: "Runs on", items: ["Hadron", "Kairos on Ubuntu", "Bring your own base"].map((l) => ({ label: l, href: `#${l}` })) },
      { title: "Reference", items: ["Configuration", "kairos CLI", "Architecture"].map((l) => ({ label: l, href: `#${l}` })) },
    ],
  },
} satisfies Meta<typeof DocsNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex min-h-[480px] border border-line">
      <DocsNav {...args} />
      <div className="flex-1 p-8 text-sm text-sub">The article.</div>
      <DocsToc
        items={[
          { label: "Overview", href: "#overview" },
          { label: "Run the console and register a node", href: "#run", current: true },
          { label: "Steps", href: "#steps" },
          { label: "Next level", href: "#next" },
        ]}
        action={<a href="#">Edit this page</a>}
      />
    </div>
  ),
};
