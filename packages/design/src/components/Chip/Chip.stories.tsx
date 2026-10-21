import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Chip } from "./Chip.tsx";

const meta = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A compact token for a node label, an active filter or a file name. Removable chips carry a labelled remove button. For a status, use StatusBadge; for a count or a category, Badge.",
      },
    },
  },
  args: { children: "site=rack2", selected: false, mono: true },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Removable: Story = {
  args: { onRemove: () => {} },
};

export const Selected: Story = {
  args: { selected: true, children: "phase:online" },
};

export const Labels: Story = {
  name: "Node labels (removable)",
  render: () => {
    const [labels, setLabels] = useState([
      "site=rack2",
      "role=worker",
      "gpu=true",
      "kairos.io/version=v3.6.0",
    ]);
    return (
      <div className="flex max-w-md flex-wrap gap-1.5">
        {labels.map((l) => (
          <Chip key={l} onRemove={() => setLabels((prev) => prev.filter((x) => x !== l))}>
            {l}
          </Chip>
        ))}
        {labels.length === 0 && <span className="text-sm text-muted">No labels</span>}
      </div>
    );
  },
};

export const Filters: Story = {
  name: "Filter chips (toggle)",
  render: () => {
    const phases = ["online", "offline", "building", "pending"];
    const [active, setActive] = useState<string[]>(["online"]);
    return (
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by phase">
        {phases.map((p) => {
          const on = active.includes(p);
          return (
            <button
              key={p}
              type="button"
              aria-pressed={on}
              onClick={() => setActive((prev) => (on ? prev.filter((x) => x !== p) : [...prev, p]))}
              className="rounded-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <Chip selected={on} mono={false}>
                {p}
              </Chip>
            </button>
          );
        })}
      </div>
    );
  },
};
