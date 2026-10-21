import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../Input/Input.tsx";
import { Textarea } from "../Textarea/Textarea.tsx";
import { Field } from "./Field.tsx";

const meta = {
  title: "Components/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A labelled control with help and error text, wired for assistive technology. Use it for every form field in a wizard or settings page; use Label and Input directly only in dense layouts such as tables.",
      },
    },
  },
  argTypes: {
    children: { table: { disable: true } },
    required: { control: "boolean" },
  },
  args: {
    id: "device",
    label: "Install device",
    help: "“auto” picks the largest disk on the machine.",
    required: false,
    children: <Input placeholder="auto" />,
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: "Choose a device, or leave “auto”.", children: <Input defaultValue="/dev/nope" /> },
};

export const Required: Story = {
  args: { required: true, help: undefined },
};

export const WithTextarea: Story = {
  args: {
    id: "cloud-config",
    label: "Cloud config",
    help: "YAML, starting with #cloud-config.",
    children: <Textarea className="font-mono" rows={5} defaultValue={"#cloud-config\nhostname: edge-01"} />,
  },
};
