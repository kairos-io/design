import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Steps, type StepItem } from "./Steps.tsx";
import { WizardSteps } from "./WizardSteps.tsx";

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
          "The checklist beside a long operation: every step the agent will run as a status diamond, the current one filled with the accent, the ones behind it healthy green, the ones ahead outlined. Steps the agent skips are simply never reached. For a form split into pages, WizardSteps is the horizontal rail of the build artifact deck.",
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
    <section className="max-w-md rounded-base bg-surface p-6">
      <Steps {...args} />
    </section>
  ),
};

const wizard = [
  { id: "base", label: "Base" },
  { id: "system", label: "System" },
  { id: "extensions", label: "Extensions" },
  { id: "access", label: "Access" },
  { id: "output", label: "Output" },
  { id: "review", label: "Review" },
];

function WizardDemo() {
  const [current, setCurrent] = useState("extensions");
  return <WizardSteps steps={wizard} current={current} onStepChange={setCurrent} label="Build steps" />;
}

export const Wizard: Story = {
  name: "WizardSteps",
  parameters: {
    docs: {
      description: {
        story:
          "The build wizard's rail: a tile bar per step, ink behind, the accent for the current step, the raised tone ahead. Every step is clickable, so a reader can go back to edit.",
      },
    },
  },
  // The canvas is a flex container that would size the rail to its six steps;
  // a block wrapper gives the rail the viewport's width to scroll within.
  render: () => (
    <div className="w-full min-w-0">
      <WizardDemo />
    </div>
  ),
};
