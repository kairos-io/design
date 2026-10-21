import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs.tsx";

function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Node sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview panel</TabsContent>
      <TabsContent value="logs">Logs panel</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("shows the default tab and switches on click", async () => {
    render(<Example />);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");
    await userEvent.click(screen.getByRole("tab", { name: "Logs" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Logs panel");
    expect(screen.getByRole("tab", { name: "Logs" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Logs" }).className).toContain("data-[state=active]:border-accent-line");
  });

  it("moves between tabs with the arrow keys", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("tab", { name: "Overview" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Logs" })).toHaveAttribute("aria-selected", "true");
  });
});
