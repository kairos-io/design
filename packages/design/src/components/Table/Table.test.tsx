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
