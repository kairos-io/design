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

const cloudConfig: Array<string | TerminalLine> = [
  "#cloud-config",
  "hostname: edge-store-{{ trunc 4 .MachineID }}",
  "users:",
  "  - name: kairos",
  "    passwd: kairos",
  "    ssh_authorized_keys:",
  "      - github:mauromorales",
  "      - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl operator@edge-store-0142.fleet.example.internal",
  "k3s:",
  "  enabled: true",
  "install:",
  "  device: auto",
  "  reboot: true",
];

const upgradeSnippet: Array<string | TerminalLine> = [
  { text: "kairos upgrade --source oci:quay.io/kairos/hadron:v0.5.2", prompt: true },
  "INFO Pulling quay.io/kairos/hadron:v0.5.2",
  "INFO Writing passive system",
  "[ERROR] bootloader: efibootmgr: EFI variables are not supported on this system",
];

function StreamingNumbered(props: React.ComponentProps<typeof Terminal>) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setLines((prev) => [...prev, installLog[i % installLog.length]]);
      i++;
      if (i > 120) clearInterval(id);
    }, 400);
    return () => clearInterval(id);
  }, []);
  return <Terminal {...props} lines={lines} />;
}

export const LineNumbers: Story = {
  name: "Line numbers",
  args: { lineNumbers: true },
  parameters: {
    docs: {
      description: {
        story:
          "`lineNumbers` adds the installer editor's gutter: right-aligned numbers in the muted ink, sized to the largest number and never narrower than two digits, hidden from assistive technology and not selectable, so the copy action and a manual selection take the text alone. A long line wraps under its own number. `firstLine` numbers a snippet from mid-file and `highlight` marks rows on the bar colour. A streamed log keeps numbering as lines arrive.",
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-3xl gap-6">
      <Terminal
        {...args}
        aria-label="Cloud config"
        title="cloud-config.yaml"
        copy
        autoscroll={false}
        maxHeight="none"
        lines={cloudConfig}
        highlight={[2]}
      />
      <Terminal
        {...args}
        aria-label="Upgrade log excerpt"
        title="upgrade.log · from line 118"
        copy={false}
        autoscroll={false}
        maxHeight="none"
        firstLine={118}
        lines={upgradeSnippet}
      />
      <StreamingNumbered
        {...args}
        aria-label="Installation log"
        title="install.log"
        copy={false}
        maxHeight={200}
      />
    </div>
  ),
};
