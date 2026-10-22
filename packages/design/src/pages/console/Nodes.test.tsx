import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { composeStories } from "@storybook/react";
import * as stories from "./Nodes.stories.tsx";

const { Nodes } = composeStories(stories);

// The node table of the Nodes page: the control in each row is the node's
// name, a button in the first cell, which the keyboard reaches and activates;
// the row is the pointer's larger target and is not a tab stop of its own.
describe("Nodes page", () => {
  function nodeRows() {
    const table = screen.getByRole("table");
    return within(table)
      .getAllByRole("row")
      .filter((row) => within(row).queryByRole("button"));
  }
  function selectedName() {
    const row = nodeRows().find((r) => r.dataset.state === "selected");
    return row ? within(row).getByRole("button").textContent : undefined;
  }

  it("makes each node's name a button and no row a tab stop", () => {
    render(<Nodes />);
    const rows = nodeRows();
    expect(rows.length).toBeGreaterThan(1);
    for (const row of rows) {
      expect(row).not.toHaveAttribute("tabindex");
      expect(row).not.toHaveAttribute("aria-selected");
    }
    expect(screen.getByRole("button", { name: "edge-store-0143" })).toHaveAttribute("aria-current", "true");
    expect(selectedName()).toBe("edge-store-0143");
  });

  it("picks a node from the keyboard, and the panel follows", async () => {
    const user = userEvent.setup();
    render(<Nodes />);
    const name = screen.getByRole("button", { name: "edge-store-0142" });
    name.focus();
    await user.keyboard("{Enter}");
    expect(selectedName()).toBe("edge-store-0142");
    expect(name).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "edge-store-0143" })).not.toHaveAttribute("aria-current");
    const panel = screen.getByText("selected node").closest("aside")!;
    expect(within(panel).getByText("edge-store-0142")).toBeInTheDocument();

    screen.getByRole("button", { name: "gpu-orin-0021" }).focus();
    await user.keyboard(" ");
    expect(selectedName()).toBe("gpu-orin-0021");
  });

  it("picks a node from a click anywhere on its row", async () => {
    const user = userEvent.setup();
    render(<Nodes />);
    const row = nodeRows().find((r) => within(r).queryByRole("button", { name: "factory-line-07" }))!;
    await user.click(within(row).getByText("plant-bcn"));
    expect(selectedName()).toBe("factory-line-07");
  });

  it("lights the row while its name has keyboard focus", () => {
    render(<Nodes />);
    const row = nodeRows()[0];
    expect(row.className).toContain("has-[:focus-visible]:ring-2");
    expect(row.className).toContain("has-[:focus-visible]:ring-inset");
    expect(within(row).getByRole("button").className).toContain("focus-visible:outline-none");
  });
});
