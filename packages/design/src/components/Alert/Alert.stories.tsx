import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle } from "lucide-react";
import { Button } from "../Button/Button.tsx";
import { Alert } from "./Alert.tsx";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A message about the state of the page: the result of an install, a warning before a step that erases a disk, a network that is not reachable. One per section, placed where the problem is. Use a toast for a passing confirmation and a StatusBadge for a single item's state.",
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: ["success", "warning", "danger", "info", "neutral"] },
    variant: { control: "select", options: ["banner", "inline"] },
  },
  args: {
    tone: "warning",
    variant: "banner",
    children: "The installer will erase /dev/sda. Everything on it is lost.",
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: (args) => (
    <div className="grid max-w-xl gap-3">
      <Alert {...args} tone="success">
        Installation completed. The node reboots into the new system.
      </Alert>
      <Alert {...args} tone="warning">
        No network: the ISO will be built from the local cache only.
      </Alert>
      <Alert {...args} tone="danger">
        Installation failed: no disk matched the selector.
      </Alert>
      <Alert {...args} tone="info">
        A newer Kairos release (v3.5.0) is available.
      </Alert>
      <Alert {...args} tone="neutral">
        This node has not reported metrics yet.
      </Alert>
    </div>
  ),
};

export const WithTitleAndAction: Story = {
  name: "With a title and an action",
  render: (args) => (
    <Alert
      {...args}
      tone="danger"
      title="Build failed"
      action={
        <Button size="sm" variant="destructive-outline">
          View logs
        </Button>
      }
      className="max-w-xl"
    >
      The image reference quay.io/kairos/ubuntu:24.04-standard could not be pulled.
    </Alert>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <Alert
      {...args}
      icon={<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
      className="max-w-xl"
    >
      Trusted boot needs a TPM 2.0. This machine reports none.
    </Alert>
  ),
};

export const Inline: Story = {
  render: (args) => (
    <div className="max-w-md rounded-xl border bg-card p-4">
      <p className="mb-2 text-sm font-medium">Cloud config</p>
      <Alert {...args} variant="inline" tone="warning">
        The config was edited by hand. The summary may be out of date.
      </Alert>
    </div>
  ),
};
