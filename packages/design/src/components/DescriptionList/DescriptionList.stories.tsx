import type { Meta, StoryObj } from "@storybook/react-vite";
import { DescriptionList } from "./DescriptionList.tsx";

const meta = {
  title: "Components/DescriptionList",
  component: DescriptionList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Facts about one thing in two columns, a hairline between rows: the Details panel of the node detail deck. The term is muted; a value an operator might copy is mono.",
      },
    },
  },
  args: {
    items: [
      { term: "Machine ID", value: "7f3a1…c09e2", mono: true },
      { term: "Seen from", value: "10.40.12.143 · remote IP", mono: true },
      { term: "Group", value: "retail-eu" },
      { term: "Claimed", value: "store-key-0143 · 3d", mono: true },
      { term: "Registered", value: "3 Oct 2026" },
    ],
  },
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InAPanel: Story = {
  render: (args) => (
    <section className="max-w-sm rounded-base bg-surface p-5">
      <h2 className="m-0 pb-2 text-lg font-bold">Details</h2>
      <DescriptionList {...args} />
    </section>
  ),
};
