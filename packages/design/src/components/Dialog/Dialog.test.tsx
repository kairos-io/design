import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button/Button.tsx";
import { ConfirmDialog } from "./ConfirmDialog.tsx";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./Dialog.tsx";

describe("Dialog", () => {
  it("opens from its trigger and closes with Escape", async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Deploy</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Deploy to node-01</DialogTitle>
          <DialogDescription>Pick a method.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Deploy" }));
    expect(screen.getByRole("dialog", { name: "Deploy to node-01" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has an accessible close button", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Body</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("ConfirmDialog", () => {
  it("confirms and closes", async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Decommission node-01?"
        description="The node is wiped on its next boot."
        confirmLabel="Decommission"
        destructive
        onConfirm={onConfirm}
      />,
    );
    const confirm = screen.getByRole("button", { name: "Decommission" });
    expect(confirm.className).toContain("bg-danger");
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("cancels without confirming", async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Rotate?"
        description="Old tokens stop working."
        onConfirm={onConfirm}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays open and shows the spinner while loading", async () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        loading
        onOpenChange={onOpenChange}
        title="Rotate?"
        description="…"
        confirmLabel="Rotate"
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Rotate" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
