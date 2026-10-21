// The illustrative fleet of the console decks: node names, images, groups
// and timings are the decks' own, not real machines.
export type NodeState = "Healthy" | "Upgrading" | "Recovery" | "Installing" | "Offline";

export interface Node {
  name: string;
  /** The node's phase, as the console shows it; StatusBadge and phaseLook() read it. */
  status: NodeState;
  image: string;
  group: string;
  seen: string;
}

const rows: [string, NodeState, string, string, string][] = [
  ["edge-store-0142", "Healthy", "hadron-v0.5.2 · k3s 1.36", "retail-eu", "12s"],
  ["edge-store-0143", "Upgrading", "hadron-v0.5.1 → v0.5.2", "retail-eu", "4s"],
  ["edge-store-0144", "Healthy", "hadron-v0.5.2 · k3s 1.36", "retail-eu", "7s"],
  ["factory-line-07", "Healthy", "ubuntu-24.04 · k0s 1.33", "plant-bcn", "31s"],
  ["factory-line-08", "Installing", "ubuntu-24.04 · k0s 1.33", "plant-bcn", "1m"],
  ["gpu-orin-0021", "Recovery", "ubuntu-22.04 · jetpack 6", "edge-ai", "2m"],
  ["gpu-orin-0022", "Healthy", "ubuntu-22.04 · jetpack 6", "edge-ai", "18s"],
  ["dc-rack-a-11", "Offline", "hadron-v0.5.0 · k3s 1.35", "dc-ams", "3h"],
  ["dc-rack-a-12", "Healthy", "hadron-v0.5.1 · k3s 1.36", "dc-ams", "9s"],
];

export const nodes: Node[] = rows.map(([name, status, image, group, seen]) => ({ name, status, image, group, seen }));

export const nodeStateOrder: NodeState[] = ["Healthy", "Upgrading", "Recovery", "Installing", "Offline"];

export const fleetStats = [
  { label: "Nodes", value: "1,284" },
  { label: "Healthy", value: "98.6%" },
  { label: "Upgrading", value: "37" },
  { label: "Image drift", value: "0" },
];
