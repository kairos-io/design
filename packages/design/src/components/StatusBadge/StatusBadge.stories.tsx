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
          "A node, build, command or deployment phase in its tone. Pass the phase string and the tone follows AuroraBoot's mapping (online is success, pending is warning, failed is danger, building is info, anything else neutral), or set the tone yourself. A missing status reads as “unknown” rather than breaking the page.",
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: [undefined, ...tones] },
    status: { control: "text" },
    dot: { control: "boolean" },
  },
  args: { status: "Online", dot: false },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Phases: Story = {
  name: "Phases, mapped to tones",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {[
        "Online",
        "Ready",
        "Pending",
        "Queued",
        "Offline",
        "Failed",
        "Running",
        "Building",
        "Upgrading",
        "Expired",
      ].map((phase) => (
        <StatusBadge key={phase} status={phase} />
      ))}
    </div>
  ),
};

export const Tones: Story = {
  name: "Explicit tones",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {tones.map((tone) => (
        <StatusBadge key={tone} tone={tone} status={tone} />
      ))}
    </div>
  ),
};

export const WithDot: Story = {
  args: { status: "Installing", dot: true },
};

export const Unknown: Story = {
  name: "Missing status",
  args: { status: "" },
};
