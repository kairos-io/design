import type { Meta, StoryObj } from "@storybook/react-vite";
import { KairosMark } from "../Logo/Logo.tsx";
import { Tile } from "../Tiles/Tile.tsx";
import { FeatureCell, FeatureGrid } from "./FeatureGrid.tsx";

const meta = {
  title: "Components/FeatureGrid",
  component: FeatureGrid,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Surface cells on a hairline grid, the way the homepages lay out the stages and the Hadron principles. `FeatureCell` takes a marker (a tile, a diamond) and a mono label on its first row.",
      },
    },
  },
  args: { minWidth: 240 },
} satisfies Meta<typeof FeatureGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const stages = [
  {
    stage: "Build",
    tone: 0,
    name: "Factory",
    job: "Kairosify any image: add kairos-init to your Dockerfile.",
    cmd: "RUN /kairos-init",
  },
  {
    stage: "Deploy",
    tone: 1,
    name: "Installer",
    job: "Configure and install from live media in a browser.",
    cmd: "http://node:8080",
  },
  {
    stage: "Operate",
    tone: 2,
    name: "Operator",
    job: "Day-2 upgrades as Kubernetes resources.",
    cmd: "kubectl apply -f nodeop.yaml",
  },
] as const;

export const Stages: Story = {
  render: (args) => (
    <FeatureGrid {...args}>
      {stages.map((s) => (
        <FeatureCell key={s.stage} marker={<Tile tone={s.tone} size={24} />} label={s.stage}>
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-2 text-[22px]">
              <KairosMark decorative height={22} />
              Kairos <b className="font-bold">{s.name}</b>
            </span>
            <span className="text-base leading-normal text-sub">{s.job}</span>
            <span className="font-mono text-xs text-muted">{s.cmd}</span>
          </div>
        </FeatureCell>
      ))}
    </FeatureGrid>
  ),
};
