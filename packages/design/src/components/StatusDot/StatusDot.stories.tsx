import type { Meta, StoryObj } from "@storybook/react-vite";
import { tones } from "../../tokens/index.ts";
import { StatusDot } from "./StatusDot.tsx";

const meta = {
  title: "Components/StatusDot",
  component: StatusDot,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The status diamond of the Foundations deck, on its own: for lists, timelines and table cells where a full StatusBadge is too loud. Filled for a state the node is in, outlined for one it is not in yet or has left. It is decorative: always put the state in words next to it.",
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: [...tones] },
    outline: { control: "boolean" },
    size: { control: "number" },
  },
  args: { tone: "success", outline: false, size: 11 },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NodeStates: Story = {
  name: "The deck's five node states",
  render: () => (
    <ul className="grid gap-2 text-sm font-semibold">
      {(
        [
          ["success", false, "Healthy"],
          ["info", false, "Upgrading"],
          ["danger", false, "Recovery"],
          ["info", true, "Installing"],
          ["neutral", true, "Offline"],
        ] as const
      ).map(([tone, outline, text]) => (
        <li key={text} className="flex items-center gap-[7px]">
          <StatusDot tone={tone} outline={outline} />
          {text}
        </li>
      ))}
    </ul>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusDot tone="success" size={11} />
      <StatusDot tone="success" size={14} />
      <StatusDot tone="success" size={20} />
    </div>
  ),
};
