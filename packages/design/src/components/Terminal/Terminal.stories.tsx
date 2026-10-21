import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Terminal, type TerminalLine } from "./Terminal.tsx";

const installLog: TerminalLine[] = [
  { text: "Connected to installation process..." },
  { text: "INFO Partitioning /dev/sda" },
  { text: "INFO Created partition oem (64 MiB)" },
  { text: "INFO Created partition recovery (4 GiB)" },
  { text: "INFO Created partition state (16 GiB)" },
  { text: "INFO Running before-install hooks" },
  { text: "INFO Installing active system from quay.io/kairos/ubuntu:24.04-standard" },
  { text: "INFO Copying 1.4 GiB" },
  { text: "INFO Configuring bootloader (grub, EFI)" },
  { text: "[ERROR] bootloader: efibootmgr: EFI variables are not supported on this system", error: true },
];

const meta = {
  title: "Components/Terminal",
  component: Terminal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The streamed log of an install, a build or a command: navy in both themes so it reads as a terminal, monospace, scrolling to the newest line. Pair it with Steps for the checklist and a Download logs button after it ends. Output is text, never HTML.",
      },
    },
  },
  args: { "aria-label": "Installation log", lines: installLog, autoscroll: true, maxHeight: 280 },
} satisfies Meta<typeof Terminal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function Streaming(props: React.ComponentProps<typeof Terminal>) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setLines((prev) => [...prev, installLog[i % installLog.length]]);
      i++;
    }, 700);
    return () => clearInterval(id);
  }, []);
  return <Terminal {...props} lines={lines} />;
}

export const StreamingLines: Story = {
  name: "Streaming with autoscroll",
  render: (args) => <Streaming {...args} maxHeight={160} />,
};

export const Empty: Story = {
  args: { lines: [], maxHeight: 120 },
};
