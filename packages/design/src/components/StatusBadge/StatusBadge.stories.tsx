import type { Meta, StoryObj } from "@storybook/react-vite";
import { tones } from "../../tokens/index.ts";
import { StatusBadge } from "./StatusBadge.tsx";

const meta = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A node, build or deployment state as the Foundations deck draws it: a diamond in the tone beside the state in ink, on a surface chip. The chip is never tinted; the diamond carries the meaning, filled for a state the node is in (Healthy, Upgrading, Recovery) and outlined for one it is not in yet or has left (Installing, Offline). Pass the phase string and the look follows the deck's mapping, or set `tone` and `outline` yourself. A missing status reads as “unknown” rather than breaking the page.",
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: [undefined, ...tones] },
    outline: { control: "boolean" },
    status: { control: "text" },
    dot: { control: "boolean" },
    bare: { control: "boolean" },
  },
  args: { status: "Healthy", dot: true, bare: false },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NodeStates: Story = {
  name: "The deck's five node states",
  render: () => (
    <div className="flex flex-wrap items-center gap-1.5">
      {["Healthy", "Upgrading", "Recovery", "Installing", "Offline"].map((phase) => (
        <StatusBadge key={phase} status={phase} />
      ))}
    </div>
  ),
};

export const Phases: Story = {
  name: "Phases, mapped to looks",
  render: () => (
    <div className="flex flex-wrap items-center gap-1.5">
      {["Online", "Ready", "Pending", "Degraded", "Failed", "Running", "Building", "Provisioning", "Expired"].map(
        (phase) => (
          <StatusBadge key={phase} status={phase} />
        ),
      )}
    </div>
  ),
};

export const Tones: Story = {
  name: "Explicit tones, filled and outlined",
  render: () => (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {tones.map((tone) => (
          <StatusBadge key={tone} tone={tone} status={tone} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {tones.map((tone) => (
          <StatusBadge key={tone} tone={tone} outline status={tone} />
        ))}
      </div>
    </div>
  ),
};

export const Bare: Story = {
  name: "Bare, in a table cell",
  render: () => (
    <table className="text-sm">
      <tbody>
        {[
          ["edge-store-0142", "Healthy"],
          ["edge-store-0143", "Upgrading"],
          ["edge-store-0144", "Offline"],
        ].map(([node, phase]) => (
          <tr key={node} className="border-b border-line">
            <td className="py-2 pr-6 font-mono text-[13px]">{node}</td>
            <td className="py-2">
              <StatusBadge status={phase} bare />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Unknown: Story = {
  name: "Missing status",
  args: { status: "" },
};
