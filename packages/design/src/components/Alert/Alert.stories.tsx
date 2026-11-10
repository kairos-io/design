import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle } from "lucide-react";
import { Alert } from "./Alert.tsx";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The callout of the Foundations deck: a surface with a diamond in the tone, a bold lead running into the text, and a link-coloured action. For a message about the state of the page: the result of an install, a warning before a step that erases a disk, a pointer to the next level. One per section, placed where it applies. Use a toast for a passing confirmation and a StatusBadge for a single item's state.",
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: ["success", "warning", "danger", "info", "neutral"] },
    variant: { control: "select", options: ["banner", "inline"] },
  },
  args: {
    tone: "info",
    variant: "banner",
    title: "Ready to automate?",
    children: (
      <>
        Every console action maps to a <code className="font-mono text-[13px]">kairos</code> command.
      </>
    ),
    action: <a href="#l2">Go to L2 →</a>,
    className: "max-w-xl",
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: (args) => (
    <div className="grid max-w-xl gap-3">
      <Alert {...args} tone="success" title="Installed." action={undefined}>
        edge-store-0142 reboots into hadron v0.5.1.
      </Alert>
      <Alert {...args} tone="warning" title="No network." action={undefined}>
        The ISO will be built from the local cache only.
      </Alert>
      <Alert {...args} tone="danger" title="Install failed." action={<a href="#logs">View logs →</a>}>
        No disk matched the selector.
      </Alert>
      <Alert {...args} tone="info" title="v0.5.2 is available." action={<a href="#rollout">Roll out →</a>}>
        12 nodes in retail-eu can upgrade now.
      </Alert>
      <Alert {...args} tone="neutral" title={undefined} action={undefined}>
        This node has not reported metrics yet.
      </Alert>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <Alert
      {...args}
      tone="warning"
      title="No TPM."
      action={undefined}
      icon={<AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-status-warning" aria-hidden="true" />}
    >
      Trusted boot needs a TPM 2.0. This machine reports none.
    </Alert>
  ),
};

export const Inline: Story = {
  render: (args) => (
    <div className="max-w-md rounded-base bg-bg p-4">
      <p className="mb-2 text-sm font-semibold">Cloud config</p>
      <Alert {...args} variant="inline" tone="warning" title="Edited by hand." action={undefined}>
        The summary may be out of date.
      </Alert>
    </div>
  ),
};
