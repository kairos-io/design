import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs.tsx";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Sections of one object (a node's overview, logs and labels) in one place. Use Tabs for peer views of the same thing; use the sidebar for navigation between things. Give the list an `aria-label`.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[480px] max-w-full">
      <TabsList aria-label="Node sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
        <TabsTrigger value="labels">Labels</TabsTrigger>
        <TabsTrigger value="metrics" disabled>
          Metrics
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="rounded-base border bg-surface p-4 text-sm">
        <dl className="grid grid-cols-[120px_1fr] gap-y-1">
          <dt className="text-muted">Hostname</dt>
          <dd className="font-mono">edge-rack2-07</dd>
          <dt className="text-muted">Image</dt>
          <dd className="font-mono">
            quay.io/kairos/ubuntu:24.04-standard-amd64-generic-v3.6.0-k3sv1.33.1-k3s1
          </dd>
          <dt className="text-muted">Phase</dt>
          <dd>Online</dd>
        </dl>
      </TabsContent>
      <TabsContent value="logs" className="rounded-base border bg-surface p-4 font-mono text-sm">
        kairos-agent: upgrade complete, rebooting into active
      </TabsContent>
      <TabsContent value="labels" className="rounded-base border bg-surface p-4 text-sm">
        site=rack2, role=worker
      </TabsContent>
      <TabsContent value="metrics">Metrics</TabsContent>
    </Tabs>
  ),
};
