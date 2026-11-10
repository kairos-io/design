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
          "The single-line text control of the Foundations deck: a surface with a 1.5px hairline that turns to ink when focused. Set `mono` for a value an operator reads character by character (a hostname, a disk path). Always give it a visible Label (or an aria-label when the layout truly has no room). For a label with help and error text, use Field.",
      },
    },
  },
  argTypes: {
    disabled: { control: "boolean" },
    mono: { control: "boolean" },
    type: { control: "select", options: ["text", "password", "email", "number", "url", "search", "file"] },
  },
  args: {
    placeholder: "edge-store-0142",
    disabled: false,
    mono: true,
    type: "text",
    "aria-label": "Hostname",
  },
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
      <Input aria-label="Image" mono placeholder="quay.io/kairos/hadron:v0.5.1" />
      <Input aria-label="Display name" placeholder="Retail Europe" />
      <Input aria-label="Password" type="password" placeholder="Password" />
      <Input aria-label="Nodes" type="number" placeholder="3" />
      <Input aria-label="Cloud config" type="file" />
    </div>
  ),
};

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "Not a hostname!" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "edge-store-0142" },
};
