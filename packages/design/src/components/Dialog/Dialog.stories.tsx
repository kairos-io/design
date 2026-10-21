import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button.tsx";
import { ConfirmDialog } from "./ConfirmDialog.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog.tsx";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A modal for a short task that needs the page's attention: a confirmation, a small form, a command. Always give it a title and a description. For anything longer than a screen, use a page instead.",
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add label</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a label to node-01</DialogTitle>
          <DialogDescription>Labels group nodes for commands and upgrades.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <label htmlFor="label" className="text-sm font-medium">
            Label
          </label>
          <input
            id="label"
            placeholder="site=lab-east"
            className="flex h-9 w-full rounded-base border border-line bg-transparent px-3 py-1 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Add label</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Open: Story = {
  name: "Open (static)",
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run a command</DialogTitle>
          <DialogDescription>The command runs on the 3 selected nodes.</DialogDescription>
        </DialogHeader>
        <pre className="rounded-base bg-inner p-3 font-mono text-xs">
          kairos-agent upgrade --source dir:/tmp/image
        </pre>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Run</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

function ConfirmExample({ destructive, slow }: { destructive?: boolean; slow?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Button variant={destructive ? "destructive-outline" : "default"} onClick={() => setOpen(true)}>
        {destructive ? "Decommission node-01" : "Rotate token"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={destructive ? "Decommission node-01?" : "Rotate the registration token?"}
        description={
          destructive
            ? "The node resets on its next boot and leaves the fleet. This cannot be undone."
            : "Nodes that have not registered yet will need the new token."
        }
        confirmLabel={destructive ? "Decommission" : "Rotate"}
        destructive={destructive}
        loading={slow ? loading : undefined}
        onConfirm={() => {
          if (!slow) return;
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            setOpen(false);
          }, 1500);
        }}
      />
    </>
  );
}

export const Confirm: Story = {
  render: () => <ConfirmExample />,
};

export const ConfirmDestructive: Story = {
  name: "Confirm (destructive)",
  render: () => <ConfirmExample destructive />,
};

export const ConfirmLoading: Story = {
  name: "Confirm (slow action)",
  render: () => <ConfirmExample slow />,
};
