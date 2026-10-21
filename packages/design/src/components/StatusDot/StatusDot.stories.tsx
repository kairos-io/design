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
          "An 8px tone dot for lists and timelines where a full StatusBadge is too loud. It is decorative: always put the status in words next to it.",
      },
    },
  },
  argTypes: { tone: { control: "select", options: [...tones] } },
  args: { tone: "success" },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllTones: Story = {
  render: () => (
    <ul className="grid gap-2 text-sm">
      {(
        [
          ["success", "node-edge-01 is online"],
          ["warning", "node-edge-02 has a pending upgrade"],
          ["danger", "node-edge-03 is offline"],
          ["info", "node-edge-04 is upgrading"],
          ["neutral", "node-edge-05 has not reported"],
        ] as const
      ).map(([tone, text]) => (
        <li key={tone} className="flex items-center gap-2">
          <StatusDot tone={tone} />
          {text}
        </li>
      ))}
    </ul>
  ),
};
