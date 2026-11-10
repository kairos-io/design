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
    id: "hostname",
    label: "Hostname",
    help: "Lowercase, digits and dashes.",
    required: false,
    children: <Input mono defaultValue="edge-store-0142" />,
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    id: "disk",
    label: "Target disk",
    help: undefined,
    error: "Disk will be wiped.",
    children: <Input mono defaultValue="/dev/nvme0n1" />,
  },
};

export const Required: Story = {
  args: { required: true, help: undefined },
};

export const WithTextarea: Story = {
  args: {
    id: "cloud-config",
    label: "Cloud config",
    help: "YAML, starting with #cloud-config.",
    children: <Textarea mono rows={5} defaultValue={"#cloud-config\nhostname: edge-store-0142"} />,
  },
};
