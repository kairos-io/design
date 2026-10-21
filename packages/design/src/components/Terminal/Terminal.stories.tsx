import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Terminal, type TerminalLine } from "./Terminal.tsx";

const command: TerminalLine[] = [
  { text: "kairos artifacts create --iso \\", prompt: true },
  { text: "  --image quay.io/kairos/hadron:v0.5.1" },
];

const installLog: TerminalLine[] = [
  { text: "Connected to installation process..." },
  { text: "INFO Partitioning /dev/nvme0n1" },
  { text: "INFO Created partition oem (64 MiB)" },
  { text: "INFO Created partition recovery (4 GiB)" },
  { text: "INFO Created partition state (16 GiB)" },
  { text: "INFO Running before-install hooks" },
  { text: "INFO Installing active system from quay.io/kairos/hadron:v0.5.1" },
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
          "The code block and log panel of the Foundations deck: the dark code ground in both themes, a bar with the title and a copy action, Martian Mono at 13px, the “$” prompt in the key colour. A streamed log scrolls to the newest line. Pair it with Steps for the checklist and a Download logs button after it ends. Output is text, never HTML.",
      },
    },
  },
  args: {
    "aria-label": "Command",
    lines: command,
    autoscroll: true,
    maxHeight: 280,
    title: "terminal",
    copy: true,
  },
} satisfies Meta<typeof Terminal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "The deck's command",
};

export const Log: Story = {
  name: "An installation log",
  args: { "aria-label": "Installation log", lines: installLog, title: "install.log", copy: false },
};

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
  args: { "aria-label": "Installation log", title: "install.log", copy: false },
  render: (args) => <Streaming {...args} maxHeight={160} />,
};

export const NoBar: Story = {
  name: "Without the bar",
  args: { title: null, copy: false },
};

export const Empty: Story = {
  args: { "aria-label": "Installation log", lines: [], maxHeight: 120, copy: false },
};
