import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../Input/Input.tsx";
import { Label } from "./Label.tsx";

const meta = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The label for a form control: 14px semibold, as the deck sets “Hostname” and “Target disk”. Point `htmlFor` at the control's id so clicking the label focuses it.",
      },
    },
  },
  args: { children: "Target disk", htmlFor: "disk" },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-1.5">
      <Label {...args} />
      <Input id="disk" mono placeholder="/dev/nvme0n1" />
    </div>
  ),
};
