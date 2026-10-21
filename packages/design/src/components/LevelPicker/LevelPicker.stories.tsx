import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { LevelPicker } from "./LevelPicker.tsx";

const levels = [
  { value: "l1", key: "L1", label: "Guided", hint: "First touch, PoC" },
  { value: "l2", key: "L2", label: "Automate", hint: "Platform engineers" },
  { value: "l3", key: "L3", label: "Extend", hint: "Contributors, OEMs" },
];

const meta = {
  title: "Components/LevelPicker",
  component: LevelPicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The docs maturity track, L1 Guided, L2 Automate, L3 Extend: a radio group on the raised surface, keyboard-navigable, with the chosen level on a surface. Use it where a page offers the same content at three depths; for a plain choice use `SegmentedControl`.",
      },
    },
  },
  args: { "aria-label": "Docs level", value: "l1", options: levels, onChange: () => {} },
} satisfies Meta<typeof LevelPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <LevelPicker {...args} value={value} onChange={setValue} className="max-w-[640px]" />;
  },
};

export const WithoutHints: Story = {
  args: { options: levels.map(({ hint: _hint, ...l }) => l) },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <LevelPicker {...args} value={value} onChange={setValue} className="max-w-[480px]" />;
  },
};
