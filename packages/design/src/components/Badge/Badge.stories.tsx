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
          "A small label for a version, an architecture, a count or a category. It is static: for a node, build or deployment status use StatusBadge, which carries a tone.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "destructive", "outline"] },
  },
  args: { children: "v3.4.0", variant: "default" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge {...args} variant="default">
        Default
      </Badge>
      <Badge {...args} variant="secondary">
        Secondary
      </Badge>
      <Badge {...args} variant="destructive">
        Destructive
      </Badge>
      <Badge {...args} variant="outline">
        Outline
      </Badge>
    </div>
  ),
};

export const InContext: Story = {
  name: "Next to a name",
  render: () => (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium">kairos-ubuntu-24.04-standard</span>
      <Badge variant="secondary">amd64</Badge>
      <Badge variant="outline">k3s v1.31.2</Badge>
    </div>
  ),
};
