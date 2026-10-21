import { render, screen } from "@testing-library/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card.tsx";

describe("Card", () => {
  it("renders the family with its content", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Nodes</CardTitle>
          <CardDescription>Every node that has registered.</CardDescription>
        </CardHeader>
        <CardContent>12 online</CardContent>
        <CardFooter>Updated just now</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Nodes")).toBeInTheDocument();
    expect(screen.getByText("Every node that has registered.")).toBeInTheDocument();
    expect(screen.getByText("12 online")).toBeInTheDocument();
    expect(screen.getByText("Updated just now")).toBeInTheDocument();
    expect(screen.getByTestId("card").className).toContain("bg-surface");
  });

  it("merges a custom class", () => {
    render(<Card data-testid="card" className="p-4" />);
    expect(screen.getByTestId("card").className).toContain("p-4");
    expect(screen.getByTestId("card").className).toContain("rounded-lg");
  });
});
