import type { Meta, StoryObj } from "@storybook/react-vite";
import { Steps, type StepItem } from "./Steps.tsx";

const install = (through: number, failed = false): StepItem[] =>
  [
    ["partition", "Partitioning disk"],
    ["before-install", "Running before-install"],
    ["active", "Installing active system"],
    ["bootloader", "Configuring bootloader"],
    ["recovery", "Creating recovery image"],
    ["passive", "Creating passive image"],
    ["after-install", "Running after-install"],
    ["done", "Installation complete"],
  ].map(([id, label], i) => ({
    id,
    label,
    state: i < through ? "done" : i === through ? (failed ? "failed" : "active") : "pending",
  }));

const meta = {
  title: "Components/Steps",
  component: Steps,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The checklist beside a long operation: every step the agent will run, with the current one highlighted and the ones behind it ticked. Steps the agent skips are simply never reached. For a form split into pages use the wizard rail instead.",
      },
    },
  },
  args: { "aria-label": "Installation steps", items: install(3) },
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const Failed: Story = { args: { items: install(3, true) } };

export const Complete: Story = { args: { items: install(8) } };

export const InACard: Story = {
  render: (args) => (
    <section className="max-w-md rounded-lg border bg-surface p-6">
      <Steps {...args} />
    </section>
  ),
};
