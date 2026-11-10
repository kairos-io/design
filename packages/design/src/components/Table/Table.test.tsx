import { render, screen } from "@testing-library/react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./Table.tsx";

describe("Table", () => {
  it("renders a real table with header cells and a caption", () => {
    render(
      <Table>
        <TableCaption>3 nodes</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phase</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow data-state="selected">
            <TableCell>node-01</TableCell>
            <TableCell>Online</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("table", { name: "3 nodes" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getByRole("cell", { name: "node-01" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /node-01/ }).className).toContain(
      "data-[state=selected]:bg-hover",
    );
  });

  it("draws the selected bar and the keyboard focus ring as shadows that compose", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-state="selected" tabIndex={0}>
            <TableCell>node-01</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByRole("row", { name: /node-01/ });
    // The accent bar is an inset-shadow and the ring is a ring, not two
    // box-shadow declarations where the later one would replace the other.
    expect(row.className).toContain("data-[state=selected]:inset-shadow-[3px_0_0_var(--accent)]");
    expect(row.className).toContain("focus-visible:ring-2");
    expect(row.className).toContain("focus-visible:ring-inset");
    expect(row.className).not.toMatch(/\[box-shadow:/);
  });
});

describe("Table scroll region", () => {
  function withMetrics(scrollWidth: number, clientWidth: number, run: () => void) {
    const sw = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth");
    const cw = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, value: scrollWidth });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, value: clientWidth });
    try {
      run();
    } finally {
      if (sw) Object.defineProperty(HTMLElement.prototype, "scrollWidth", sw);
      if (cw) Object.defineProperty(HTMLElement.prototype, "clientWidth", cw);
    }
  }

  it("takes no tab stop while the table fits", () => {
    withMetrics(300, 300, () => {
      const { container } = render(
        <Table aria-label="Nodes">
          <TableBody>
            <TableRow>
              <TableCell>edge-store-0142</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      const box = container.querySelector("div")!;
      expect(box).not.toHaveAttribute("tabindex");
    });
  });

  it("becomes focusable, with a visible ring, once the table is wider than its box", () => {
    withMetrics(700, 390, () => {
      const { container } = render(
        <Table aria-label="Nodes">
          <TableBody>
            <TableRow>
              <TableCell>edge-store-0142</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      const box = container.querySelector("div")!;
      expect(box).toHaveAttribute("tabindex", "0");
      expect(box.className).toContain("focus-visible:ring-inset");
    });
  });

  it("survives a page with no ResizeObserver", () => {
    const observer = globalThis.ResizeObserver;
    // @ts-expect-error removing it is the point of the test
    delete globalThis.ResizeObserver;
    try {
      withMetrics(700, 390, () => {
        expect(() =>
          render(
            <Table aria-label="Nodes">
              <TableBody>
                <TableRow>
                  <TableCell>edge-store-0142</TableCell>
                </TableRow>
              </TableBody>
            </Table>,
          ),
        ).not.toThrow();
      });
    } finally {
      globalThis.ResizeObserver = observer;
    }
  });
});
