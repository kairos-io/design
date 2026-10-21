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
      "data-[state=selected]:bg-muted",
    );
  });
});
