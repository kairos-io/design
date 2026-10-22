import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl.tsx";

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "One choice from two to five short options, shown all at once on a raised track with the chosen one lifted to the surface: the docs' level picker, an architecture, an output format. It is a radio group: arrow keys move the choice and skip disabled options. Longer lists go in a Select.",
      },
    },
  },
  argTypes: {
    onChange: { table: { disable: true } },
    value: { table: { disable: true } },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

type Level = "l1" | "l2" | "l3";
const levels: SegmentedOption<Level>[] = [
  { value: "l1", label: "Guided", code: "L1" },
  { value: "l2", label: "Automate", code: "L2" },
  { value: "l3", label: "Extend", code: "L3" },
];

type Arch = "amd64" | "arm64" | "riscv64";
const archOptions: SegmentedOption<Arch>[] = [
  { value: "amd64", label: "amd64", hint: "x86-64 servers and VMs" },
  { value: "arm64", label: "arm64", hint: "Raspberry Pi, Ampere, Graviton" },
  { value: "riscv64", label: "riscv64", hint: "Experimental", disabled: true },
];

function Controlled<T extends string>(props: {
  options: SegmentedOption<T>[];
  initial: T;
  "aria-label": string;
  fill?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState<T>(props.initial);
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => setValue(v)}
      options={props.options}
      aria-label={props["aria-label"]}
      fill={props.fill}
      className={props.className}
    />
  );
}

export const Default: Story = {
  name: "The docs' level picker",
  args: { value: "l1", onChange: () => {}, options: levels, "aria-label": "Docs level" },
  render: () => <Controlled options={levels} initial="l1" aria-label="Docs level" className="max-w-md" />,
};

export const WithHints: Story = {
  args: { value: "amd64", onChange: () => {}, options: archOptions, "aria-label": "Architecture" },
  render: () => (
    <Controlled options={archOptions} initial="amd64" aria-label="Architecture" className="max-w-lg" />
  ),
};

export const Compact: Story = {
  name: "Own widths",
  args: { value: "iso", onChange: () => {}, options: [], "aria-label": "Output" },
  render: () => (
    <Controlled
      fill={false}
      options={[
        { value: "iso", label: "ISO" },
        { value: "raw", label: "Raw disk" },
        { value: "container", label: "Container" },
        { value: "netboot", label: "Netboot" },
      ]}
      initial="iso"
      aria-label="Output format"
    />
  ),
};
