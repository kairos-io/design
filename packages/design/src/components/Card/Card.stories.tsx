import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card.tsx";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The surface for a group of related content: a settings section, a summary, a form step. Use the header, content and footer parts so spacing stays consistent. Do not nest cards; use a Separator or a StatTile grid instead.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Registration token</CardTitle>
        <CardDescription>Nodes present this token when they first call home.</CardDescription>
      </CardHeader>
      <CardContent>
        <code className="rounded bg-muted px-2 py-1 font-mono text-xs">kairos-7f3a-9c21-ab40</code>
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Rotate token</Button>
        <Button variant="outline">Copy</Button>
      </CardFooter>
    </Card>
  ),
};

export const ContentOnly: Story = {
  name: "Content only",
  render: () => (
    <Card className="max-w-md p-6">
      <p className="text-sm">
        A card can hold plain content with its own padding when a title would only repeat the page header.
      </p>
    </Card>
  ),
};

export const Grid: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
      {["Ubuntu 24.04", "Alpine 3.21", "Fedora 42", "openSUSE Leap 16"].map((flavor) => (
        <Card key={flavor}>
          <CardHeader>
            <CardTitle>{flavor}</CardTitle>
            <CardDescription>
              quay.io/kairos/{flavor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Standard image with k3s.</CardContent>
        </Card>
      ))}
    </div>
  ),
};
