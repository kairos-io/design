import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, Plus, Rocket, Trash2 } from "lucide-react";
import { Button } from "./Button.tsx";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The action control. One primary button per view; outline and ghost for the rest; destructive only for actions that lose data. Icon-only sizes need an `aria-label`.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "destructive-outline",
        "link",
        "on-navy",
      ],
    },
    size: { control: "select", options: ["sm", "default", "lg", "icon", "icon-sm"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    asChild: { table: { disable: true } },
  },
  args: {
    children: "Build ISO",
    variant: "default",
    size: "default",
    loading: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="default">
        Primary
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="destructive">
        Destructive
      </Button>
      <Button {...args} variant="destructive-outline">
        Destructive outline
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
      <Button {...args} size="icon" aria-label="Add">
        <Plus />
      </Button>
      <Button {...args} size="icon-sm" aria-label="Add">
        <Plus />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>
        <Rocket /> Deploy
      </Button>
      <Button {...args} variant="outline">
        <Download /> Download logs
      </Button>
      <Button {...args} variant="destructive-outline">
        <Trash2 /> Decommission
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  args: { loading: true, children: "Building" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AsLink: Story = {
  name: "As a link (asChild)",
  render: (args) => (
    <Button {...args} asChild>
      <a href="https://kairos.io/docs" target="_blank" rel="noreferrer">
        Read the docs
      </a>
    </Button>
  ),
};

export const OnNavy: Story = {
  name: "On the navy sidebar",
  parameters: { backgrounds: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-2 rounded-lg bg-sidebar-bg p-4">
      <Button {...args} variant="on-navy">
        Logout
      </Button>
      <Button {...args} variant="on-navy" size="icon" aria-label="Collapse sidebar">
        <Plus />
      </Button>
    </div>
  ),
};
