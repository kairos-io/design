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
          "Sections of one object (a node's overview, nodes and keys) in one place, as the Foundations deck draws them: 15px semibold on a hairline, the active tab in ink with a 2px accent line under it. Use Tabs for peer views of the same thing; use the sidebar for navigation between things. Give the list an `aria-label`.",
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
        <TabsTrigger value="nodes">Nodes</TabsTrigger>
        <TabsTrigger value="keys">Keys</TabsTrigger>
        <TabsTrigger value="metrics" disabled>
          Metrics
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="rounded-base bg-surface p-4 text-sm">
        <dl className="grid grid-cols-[120px_1fr] gap-y-1">
          <dt className="text-muted">Hostname</dt>
          <dd className="font-mono text-[13px]">edge-store-0142</dd>
          <dt className="text-muted">Image</dt>
          <dd className="font-mono text-[13px] wrap-anywhere">quay.io/kairos/hadron:v0.5.1</dd>
          <dt className="text-muted">State</dt>
          <dd>Healthy</dd>
        </dl>
      </TabsContent>
      <TabsContent value="nodes" className="rounded-base bg-surface p-4 font-mono text-[13px]">
        40 nodes in retail-eu, 33 on v0.5.1
      </TabsContent>
      <TabsContent value="keys" className="rounded-base bg-surface p-4 text-sm">
        site=rack2, role=worker
      </TabsContent>
      <TabsContent value="metrics">Metrics</TabsContent>
    </Tabs>
  ),
};
