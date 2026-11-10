import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge.tsx";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A tag, as the Foundations deck draws them: mono at 12px on the raised fill with a 2px radius, or a hairline instead of a fill. For a version, an architecture, a group or a count. It is static: for a node, build or deployment status use StatusBadge, which carries a tone.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["default", "outline", "accent", "destructive"] },
  },
  args: { children: "hadron v0.5.1", variant: "default" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  name: "The deck's row",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge {...args}>hadron v0.5.1</Badge>
      <Badge {...args}>k3s 1.36</Badge>
      <Badge {...args} variant="outline">
        group: retail-eu
      </Badge>
      <Badge {...args} variant="accent">
        3 new
      </Badge>
      <Badge {...args} variant="destructive">
        2 failed
      </Badge>
    </div>
  ),
};

export const InContext: Story = {
  name: "Next to a name",
  render: () => (
    <div className="flex items-center gap-2 text-[15px]">
      <span className="font-semibold">edge-store-0142</span>
      <Badge>amd64</Badge>
      <Badge variant="outline">k3s 1.36</Badge>
    </div>
  ),
};
