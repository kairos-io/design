import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "../Button/Button.tsx";
import { PageHeader } from "./PageHeader.tsx";

const meta = {
  title: "Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The top of a page: breadcrumb, h1 with an optional status badge, a description or a meta line, and the actions on the right in placement order (secondary, primary, overflow). One per page. Hosts with a router give a crumb its own `element` (their `<Link>`) so breadcrumbs navigate client-side.",
      },
    },
  },
  argTypes: {
    status: { table: { disable: true } },
    meta: { table: { disable: true } },
  },
  args: {
    title: "Nodes",
    description: "Every machine registered with this console.",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  render: (args) => (
    <PageHeader {...args}>
      <Button variant="outline">
        <RefreshCw /> Refresh
      </Button>
      <Button>
        <Plus /> Register node
      </Button>
    </PageHeader>
  ),
};

export const DetailPage: Story = {
  name: "Detail page with breadcrumb, status and meta",
  args: {
    title: "edge-node-01",
    description: undefined,
    breadcrumb: [{ label: "Nodes", href: "#" }, { label: "edge-node-01" }],
    status: (
      <span className="inline-flex items-center rounded-base border border-status-healthy/25 bg-status-healthy/15 px-2.5 py-0.5 text-xs font-semibold text-ok">
        online
      </span>
    ),
    meta: (
      <>
        <span>192.168.1.42</span>
        <span>quay.io/kairos/ubuntu:24.04-standard-amd64-generic-v3.5.0-k3sv1.33.2</span>
      </>
    ),
  },
  render: (args) => (
    <PageHeader {...args}>
      <Button variant="outline">Run command</Button>
      <Button>Upgrade</Button>
    </PageHeader>
  ),
};
