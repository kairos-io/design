import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./Separator.tsx";

const meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A one-pixel hairline in `--line` between groups of content. Use it inside cards, menus and the sidebar; use spacing alone between sections of a page.",
      },
    },
  },
  argTypes: { orientation: { control: "radio", options: ["horizontal", "vertical"] } },
  args: { orientation: "horizontal" },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-sm">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold leading-none">hadron v0.5.1</h4>
        <p className="text-sm text-sub">k3s 1.36, group: retail-eu</p>
      </div>
      <Separator {...args} className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Nodes</span>
        <Separator orientation="vertical" />
        <span>Artifacts</span>
        <Separator orientation="vertical" />
        <span>Deployments</span>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-8 items-center gap-3 text-sm">
      <span className="font-mono text-[13px]">edge-store-0142</span>
      <Separator {...args} />
      <span>10.0.4.12</span>
      <Separator {...args} />
      <span>Healthy</span>
    </div>
  ),
};
