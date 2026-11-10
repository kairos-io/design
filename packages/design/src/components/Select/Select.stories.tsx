import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../Label/Label.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./Select.tsx";

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "One choice from a list too long for a SegmentedControl: a target disk, a base image, a Kubernetes release. The trigger is drawn like Input and takes `mono` for technical values. Built on Radix Select, so it is a combobox with full keyboard support. Always pair the trigger with a Label or an `aria-label`.",
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "The deck's target disk",
  render: () => (
    <div className="grid w-[320px] max-w-full gap-1.5">
      <Label htmlFor="disk">Target disk</Label>
      <Select defaultValue="nvme0n1">
        <SelectTrigger id="disk" mono>
          <SelectValue placeholder="Choose a disk" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nvme0n1">/dev/nvme0n1</SelectItem>
          <SelectItem value="sda">/dev/sda</SelectItem>
          <SelectItem value="auto">auto</SelectItem>
        </SelectContent>
      </Select>
      <span className="text-[13px] text-status-recovery">Disk will be wiped.</span>
    </div>
  ),
};

export const BaseImage: Story = {
  render: () => (
    <div className="grid w-[320px] max-w-full gap-1.5">
      <Label htmlFor="base-image">Base image</Label>
      <Select defaultValue="ubuntu-24.04">
        <SelectTrigger id="base-image">
          <SelectValue placeholder="Choose a base image" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ubuntu-24.04">Ubuntu 24.04</SelectItem>
          <SelectItem value="ubuntu-22.04">Ubuntu 22.04</SelectItem>
          <SelectItem value="fedora-42">Fedora 42</SelectItem>
          <SelectItem value="alpine-3.21">Alpine 3.21</SelectItem>
          <SelectItem value="rockylinux-9">Rocky Linux 9</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Grouped: Story = {
  render: () => (
    <div className="grid w-[320px] max-w-full gap-1.5">
      <Label htmlFor="k8s">Kubernetes</Label>
      <Select>
        <SelectTrigger id="k8s">
          <SelectValue placeholder="Choose a distribution" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Lightweight</SelectLabel>
            <SelectItem value="k3s-1.33">k3s v1.33.1+k3s1</SelectItem>
            <SelectItem value="k0s-1.33">k0s v1.33.1+k0s.0</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Full</SelectLabel>
            <SelectItem value="kubeadm-1.33">kubeadm v1.33.1</SelectItem>
            <SelectItem value="rke2-1.33">RKE2 v1.33.1+rke2r1</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value="none">No Kubernetes</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="grid w-[320px] max-w-full gap-1.5">
      <Label htmlFor="arch">Architecture</Label>
      <Select defaultValue="amd64" disabled>
        <SelectTrigger id="arch">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="amd64">amd64</SelectItem>
          <SelectItem value="arm64">arm64</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
