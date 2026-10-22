import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button.tsx";
import { KairosMark } from "../Logo/Logo.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardLabel,
  CardTitle,
  CardValue,
} from "./Card.tsx";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The surface for a group of related content, as the Foundations deck draws it: `--surface` on the canvas with a 4px radius and no shadow or border; the tone step is the edge. Use the header, content and footer parts so spacing stays consistent; `CardLabel` and `CardValue` make a stat card. Do not nest cards; use a Separator instead.",
      },
    },
  },
  argTypes: { bordered: { control: "boolean" } },
  args: { bordered: false },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KairosMark className="h-5 w-5" />
          <span>
            <b className="font-bold">Kairos</b> console
          </span>
        </CardTitle>
        <CardDescription>Factory, Deploy and Fleet in one console.</CardDescription>
      </CardHeader>
      <CardFooter className="gap-2">
        <Button size="sm">Open console</Button>
        <Button size="sm" variant="link">
          Learn more →
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Stat: Story = {
  name: "A stat",
  render: (args) => (
    <div className="grid max-w-md grid-cols-2 gap-2">
      <Card {...args}>
        <CardHeader className="gap-1">
          <CardLabel>Healthy</CardLabel>
          <CardValue>98.6%</CardValue>
        </CardHeader>
      </Card>
      <Card {...args}>
        <CardHeader className="gap-1">
          <CardLabel>Nodes</CardLabel>
          <CardValue>40</CardValue>
        </CardHeader>
      </Card>
    </div>
  ),
};

export const ContentOnly: Story = {
  name: "Content only",
  render: (args) => (
    <Card {...args} className="max-w-md p-4">
      <p className="text-sm text-sub">
        A card can hold plain content with its own padding when a title would only repeat the page header.
      </p>
    </Card>
  ),
};

export const Grid: Story = {
  render: (args) => (
    <div className="grid max-w-3xl gap-2 sm:grid-cols-2">
      {["Ubuntu 24.04", "Alpine 3.21", "Fedora 42", "openSUSE Leap 16"].map((flavor) => (
        <Card {...args} key={flavor}>
          <CardHeader>
            <CardTitle>{flavor}</CardTitle>
            <CardDescription className="font-mono text-[13px]">
              quay.io/kairos/{flavor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-sub">Standard image with k3s.</CardContent>
        </Card>
      ))}
    </div>
  ),
};
