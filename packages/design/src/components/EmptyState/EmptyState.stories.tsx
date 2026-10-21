import type { Meta, StoryObj } from "@storybook/react-vite";
import { Package, Search, Server } from "lucide-react";
import { Button } from "../Button/Button.tsx";
import { EmptyState } from "./EmptyState.tsx";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "What a list, table or board shows when it has nothing to show. Say what would fill it and give the one action that does. For a search with no hits, say so and offer to clear the filter.",
      },
    },
  },
  argTypes: { icon: { table: { disable: true } } },
  args: {
    icon: Server,
    title: "No nodes yet",
    description: "Boot a machine from a Kairos ISO or netboot it; it registers here on first boot.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: { action: <Button>Build an ISO</Button> },
};

export const NoResults: Story = {
  name: "No results for a filter",
  args: {
    icon: Search,
    title: "No nodes match",
    description: 'No node matches "role=worker" and "offline".',
    action: (
      <Button variant="outline" size="sm">
        Clear filters
      </Button>
    ),
  },
};

export const InACard: Story = {
  render: (args) => (
    <div className="max-w-lg rounded-xl border bg-card">
      <EmptyState
        {...args}
        icon={Package}
        title="No artifacts"
        description="Built ISOs and disk images appear here."
      />
    </div>
  ),
};
