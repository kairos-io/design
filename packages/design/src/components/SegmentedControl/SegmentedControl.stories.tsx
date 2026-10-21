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
          "One choice from two to five short options, shown all at once: an architecture, an output format, a boot mode. It is a radio group: arrow keys move the choice and skip disabled options. Longer lists go in a Select.",
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
}) {
  const [value, setValue] = useState<T>(props.initial);
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => setValue(v)}
      options={props.options}
      aria-label={props["aria-label"]}
    />
  );
}

export const Default: Story = {
  args: { value: "amd64", onChange: () => {}, options: archOptions, "aria-label": "Architecture" },
  render: () => <Controlled options={archOptions} initial="amd64" aria-label="Architecture" />,
};

export const WithoutHints: Story = {
  args: { value: "iso", onChange: () => {}, options: [], "aria-label": "Output" },
  render: () => (
    <Controlled
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
