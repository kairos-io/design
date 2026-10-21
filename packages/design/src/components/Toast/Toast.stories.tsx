import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { Button } from "../Button/Button.tsx";
import { toast } from "./toast.ts";
import { Toaster } from "./Toaster.tsx";

const meta = {
  title: "Components/Toast",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A passing confirmation in the bottom-right corner: an action was queued, a copy succeeded, a node was moved. Mount one `Toaster` near the app root and call `toast(message, tone)` from anywhere. Toasts go away on their own, so never put something the user must act on in one; that is an Alert.",
      },
    },
  },
  args: { duration: 3000 },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex min-h-64 flex-wrap items-start gap-2 p-6">
      <Button onClick={() => toast("ISO build queued", "success")}>Success</Button>
      <Button variant="outline" onClick={() => toast("Label copied")}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast("Node is offline; the command is queued", "warning")}>
        Warning
      </Button>
      <Button variant="destructive-outline" onClick={() => toast("Could not reach the BMC", "danger")}>
        Danger
      </Button>
      <Toaster {...args} />
    </div>
  ),
};

function Preloaded(props: React.ComponentProps<typeof Toaster>) {
  useEffect(() => {
    toast("ISO build queued", "success");
    toast("Could not reach the BMC at 10.0.0.12", "danger");
  }, []);
  return <Toaster {...props} />;
}

export const Open: Story = {
  name: "Two toasts showing",
  args: { duration: 60_000 },
  render: (args) => (
    <div className="min-h-48 p-6">
      <Preloaded {...args} />
    </div>
  ),
};
