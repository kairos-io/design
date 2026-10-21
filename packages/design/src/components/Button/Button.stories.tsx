import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, Plus, RotateCcw } from "lucide-react";
import { Button } from "./Button.tsx";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The buttons of the Foundations deck. `default` is the accent with dark ink on it, for the one action that matters on a view (“Download ISO”). `dark` (also `secondary`) is the ink button (“Read the docs”). `outline` is a 1.5px ink hairline (“GitHub”). `link` is an inline action in the link colour (“Learn more →”). `destructive` is the recovery red for anything that loses data (“Reset node”). `ghost` has no chrome until hovered, for toolbars. Focus is a 2px ink outline; disabled is the raised fill with muted ink. Icon-only sizes need an `aria-label`.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "dark", "outline", "ghost", "link", "destructive", "destructive-outline"],
    },
    size: { control: "select", options: ["sm", "default", "lg", "icon", "icon-sm"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    asChild: { table: { disable: true } },
  },
  args: {
    children: "Download ISO",
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
  name: "The deck's row",
  render: (args) => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button {...args} variant="default">
          Download ISO
        </Button>
        <Button {...args} variant="dark">
          Read the docs
        </Button>
        <Button {...args} variant="outline">
          GitHub
        </Button>
        <Button {...args} variant="link">
          Learn more →
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button {...args} size="sm">
          Small
        </Button>
        <Button {...args} disabled>
          Disabled
        </Button>
        <Button {...args} variant="destructive">
          Reset node
        </Button>
        <Button {...args} variant="ghost">
          Ghost
        </Button>
        <Button {...args} variant="destructive-outline">
          Decommission
        </Button>
      </div>
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
      <Button {...args} size="icon" aria-label="Add node">
        <Plus />
      </Button>
      <Button {...args} size="icon-sm" aria-label="Add node">
        <Plus />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>
        <Download /> Download ISO
      </Button>
      <Button {...args} variant="outline">
        <Download /> Download logs
      </Button>
      <Button {...args} variant="destructive-outline">
        <RotateCcw /> Reset node
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
    <Button {...args} variant="dark" asChild>
      <a href="https://kairos.io/docs" target="_blank" rel="noreferrer">
        Read the docs
      </a>
    </Button>
  ),
};

export const OnDark: Story = {
  name: "In the dark theme",
  render: (args) => (
    <div data-theme="dark" className="flex flex-wrap items-center gap-2 rounded-base bg-bg p-6">
      <Button {...args} variant="default">
        Download ISO
      </Button>
      <Button {...args} variant="dark">
        Read the docs
      </Button>
      <Button {...args} variant="outline">
        GitHub
      </Button>
      <Button {...args} variant="link">
        Learn more →
      </Button>
    </div>
  ),
};
