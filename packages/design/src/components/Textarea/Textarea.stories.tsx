import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../Label/Label.tsx";
import { Textarea } from "./Textarea.tsx";

const cloudConfig = `#cloud-config
hostname: edge-store-{{ trunc 4 .MachineID }}
users:
  - name: kairos
    passwd: kairos
install:
  device: auto
  reboot: true`;

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The multi-line text control, drawn like Input, for cloud configs, extension lists and notes. Set `mono` when the content is code or YAML.",
      },
    },
  },
  argTypes: { disabled: { control: "boolean" }, mono: { control: "boolean" } },
  args: { placeholder: "#cloud-config", disabled: false, mono: true, "aria-label": "Cloud config", rows: 4 },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CloudConfig: Story = {
  name: "YAML editor",
  render: () => (
    <div className="grid max-w-xl gap-1.5">
      <Label htmlFor="cloud-config">Cloud config</Label>
      <Textarea id="cloud-config" mono className="min-h-[200px] leading-relaxed" defaultValue={cloudConfig} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read only" },
};
