import type { Meta, StoryObj } from "@storybook/react-vite";
import { cn } from "../../lib/cn.ts";
import { phaseTone, toneSoft } from "../../lib/tone.ts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table.tsx";

const meta = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Rows of records with the same columns: nodes, artifacts, deployments. Keep cells to one line; put status in a badge and actions at the end. Use a caption or a visible heading so the table has a name. For a handful of key/value facts, use a description list instead.",
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const nodes = [
  { name: "edge-lab-01", phase: "Online", version: "v3.5.2", k8s: "k3s v1.33.1", ip: "10.1.0.11" },
  { name: "edge-lab-02", phase: "Upgrading", version: "v3.5.1", k8s: "k3s v1.33.1", ip: "10.1.0.12" },
  { name: "edge-lab-03", phase: "Offline", version: "v3.4.0", k8s: "k3s v1.32.4", ip: "10.1.0.13" },
  { name: "rack-a-04", phase: "Pending", version: "—", k8s: "—", ip: "10.2.0.4" },
];

export const Nodes: Story = {
  render: () => (
    <Table>
      <TableCaption>4 nodes in lab-east</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phase</TableHead>
          <TableHead>Kairos</TableHead>
          <TableHead>Kubernetes</TableHead>
          <TableHead className="text-right">Address</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((n) => (
          <TableRow key={n.name}>
            <TableCell className="font-medium">{n.name}</TableCell>
            <TableCell>
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                  toneSoft[phaseTone(n.phase)],
                )}
              >
                {n.phase}
              </span>
            </TableCell>
            <TableCell className="font-mono text-xs">{n.version}</TableCell>
            <TableCell className="font-mono text-xs">{n.k8s}</TableCell>
            <TableCell className="text-right font-mono text-xs">{n.ip}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooterAndSelection: Story = {
  name: "With footer and a selected row",
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">
            <input type="checkbox" aria-label="Select all" className="accent-primary" />
          </TableHead>
          <TableHead>Artifact</TableHead>
          <TableHead>Size</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state="selected">
          <TableCell>
            <input
              type="checkbox"
              aria-label="Select kairos-ubuntu-24.04.iso"
              defaultChecked
              className="accent-primary"
            />
          </TableCell>
          <TableCell>kairos-ubuntu-24.04-standard-amd64.iso</TableCell>
          <TableCell className="tabular-nums">1.4 GB</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <input type="checkbox" aria-label="Select kairos-alpine-3.21.raw" className="accent-primary" />
          </TableCell>
          <TableCell>kairos-alpine-3.21-core-arm64.raw</TableCell>
          <TableCell className="tabular-nums">812 MB</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="tabular-nums">2.2 GB</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
