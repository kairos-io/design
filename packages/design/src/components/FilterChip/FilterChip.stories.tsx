import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FilterChip } from "./FilterChip.tsx";

const meta = {
  title: "Components/FilterChip",
  component: FilterChip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A toggle in a short row: the status filters over the node list, the base images and Kubernetes distributions of the build wizard. Selected is ink with the page colour on it; the rest sit on a surface. A `status` draws its diamond, a `count` follows the label in mono. For a token that names a thing rather than a choice, use Chip.",
      },
    },
  },
  args: { children: "Healthy", status: "Healthy", count: 5, selected: false },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const statuses = ["All", "Healthy", "Upgrading", "Recovery", "Installing", "Offline"];
const counts: Record<string, number> = {
  All: 9,
  Healthy: 5,
  Upgrading: 1,
  Recovery: 1,
  Installing: 1,
  Offline: 1,
};

function StatusFilters() {
  const [picked, setPicked] = useState("All");
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
      {statuses.map((s) => (
        <FilterChip
          key={s}
          selected={picked === s}
          status={s === "All" ? undefined : s}
          count={counts[s]}
          onSelect={() => setPicked(s)}
        >
          {s}
        </FilterChip>
      ))}
    </div>
  );
}

export const Statuses: Story = {
  name: "The status filters",
  render: () => <StatusFilters />,
};

function Bases() {
  const [picked, setPicked] = useState(0);
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Base">
      {["Hadron", "Ubuntu 24.04", "Fedora 42", "Alpine 3.22", "Rocky 9"].map((b, i) => (
        <FilterChip key={b} selected={picked === i} onSelect={() => setPicked(i)}>
          {b}
        </FilterChip>
      ))}
    </div>
  );
}

export const PickList: Story = {
  name: "A pick list",
  render: () => <Bases />,
};
