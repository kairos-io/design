import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox.tsx";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A native checkbox in the primary colour, for options that are on or off (autoscroll, format the disk, include an extension). For one choice out of several, use SegmentedControl or Select.",
      },
    },
  },
  args: { label: "Autoscroll", disabled: false },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { label: "Format the disk", description: "Erases everything on /dev/sda before installing." },
};

export const Checked: Story = {
  args: { label: "Include the trusted boot keys", defaultChecked: true },
};

export const Disabled: Story = {
  args: { label: "Enable P2P (needs a network token)", disabled: true },
};

export const Group: Story = {
  render: () => (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium">System extensions</legend>
      <Checkbox label="nvidia-drivers" description="Proprietary GPU drivers" defaultChecked />
      <Checkbox label="qemu-guest-agent" />
      <Checkbox label="tailscale" />
    </fieldset>
  ),
};
