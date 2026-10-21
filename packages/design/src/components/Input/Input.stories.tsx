import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../Label/Label.tsx";
import { Input } from "./Input.tsx";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The single-line text control. Always give it a visible Label (or an aria-label when the layout truly has no room). For a label with help and error text, use Field.",
      },
    },
  },
  argTypes: {
    disabled: { control: "boolean" },
    type: { control: "select", options: ["text", "password", "email", "number", "url", "search", "file"] },
  },
  args: { placeholder: "edge-node-01", disabled: false, type: "text", "aria-label": "Hostname" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-1.5">
      <Label htmlFor="hostname">Hostname</Label>
      <Input {...args} id="hostname" aria-label={undefined} />
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div className="grid max-w-sm gap-3">
      <Input aria-label="Image" placeholder="quay.io/kairos/ubuntu:24.04-core-amd64-generic-v3.4.0" />
      <Input aria-label="Password" type="password" placeholder="Password" />
      <Input aria-label="Nodes" type="number" placeholder="3" />
      <Input aria-label="Cloud config" type="file" />
    </div>
  ),
};

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "not a hostname!" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "edge-node-01" },
};
