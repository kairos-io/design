import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "../Field/Field.tsx";
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

export const LineNumbers: Story = {
  name: "Line numbers",
  parameters: {
    docs: {
      description: {
        story:
          "`lineNumbers` adds a gutter that counts the value's lines and follows the control's scroll, for a config file an operator edits by line. It implies `mono`. A line-numbered textarea does not soft-wrap: a long line scrolls sideways so every number sits beside exactly one line. While the control has focus the caret's line (or every line a selection spans) shows its number in ink on a faint band, as an editor does; `highlight` marks a validator's lines in the danger tone, here line 5 to match the error text. The gutter and the bands are decorative and not part of the value; the control keeps its label, description and invalid state, here through Field.",
      },
    },
  },
  render: () => (
    <Field
      id="cloud-config-numbered"
      label="Cloud config"
      help="Applied on first boot."
      error="Line 5: a mapping value is not allowed here."
    >
      <Textarea
        lineNumbers
        highlight={[5]}
        rows={14}
        defaultValue={`${cloudConfig}
    ssh_authorized_keys:
      - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl operator@edge-store-0142.fleet.example.internal
k3s:
  enabled: true`}
      />
    </Field>
  ),
};

export const LineNumbersDisabled: Story = {
  name: "Line numbers, disabled",
  render: () => (
    <div className="grid max-w-xl gap-1.5">
      <Label htmlFor="cloud-config-ro">Cloud config</Label>
      <Textarea id="cloud-config-ro" lineNumbers disabled rows={9} defaultValue={cloudConfig} />
    </div>
  ),
};
