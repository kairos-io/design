import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Server } from "lucide-react";
import {
  AppShell,
  Sidebar,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSection,
  SidebarSteps,
  Topbar,
} from "./Sidebar.tsx";

describe("Sidebar", () => {
  it("renders items as links with the active one marked", () => {
    render(
      <Sidebar mode="full">
        <SidebarNav>
          <SidebarSection label="Fleet">
            <SidebarItem href="/nodes" icon={Server} label="Nodes" active />
            <SidebarItem href="/groups" icon={Server} label="Groups" />
          </SidebarSection>
        </SidebarNav>
      </Sidebar>,
    );
    const nodes = screen.getByRole("link", { name: "Nodes" });
    expect(nodes).toHaveAttribute("aria-current", "page");
    expect(nodes.className).toContain("bg-raised");
    expect(screen.getByRole("link", { name: "Groups" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    // Focus scrolls an item into the nav with its ring's 2px kept inside the scrollport.
    expect(nodes).toHaveClass("scroll-my-0.5");
  });

  it("shows a count after the label and marks the active item with a tile", () => {
    render(
      <Sidebar mode="full">
        <SidebarNav>
          <SidebarItem href="/nodes" label="Nodes" count="1,284" active />
        </SidebarNav>
      </Sidebar>,
    );
    const link = screen.getByRole("link", { name: "Nodes" });
    expect(link).toHaveTextContent("1,284");
    expect(link.querySelector("svg polygon")?.getAttribute("class")).toContain("fill-accent");
  });

  it("hides labels on the rail but keeps them for assistive technology", () => {
    render(
      <Sidebar mode="rail">
        <SidebarNav>
          <SidebarItem href="/nodes" icon={Server} label="Nodes" />
        </SidebarNav>
      </Sidebar>,
    );
    const link = screen.getByRole("link", { name: "Nodes" });
    expect(link).toHaveAttribute("title", "Nodes");
    expect(screen.getByText("Nodes").className).toContain("sr-only");
  });

  it("opens external items in a new tab", () => {
    render(
      <Sidebar mode="full">
        <SidebarItem href="/api/docs" icon={Server} label="API docs" external />
      </Sidebar>,
    );
    const link = screen.getByRole("link", { name: "API docs" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("lets the host render its own link with asChild", () => {
    render(
      <Sidebar mode="full">
        <SidebarItem icon={Server} label="Nodes" asChild>
          <a href="/nodes" data-router="yes" />
        </SidebarItem>
      </Sidebar>,
    );
    const link = screen.getByRole("link", { name: "Nodes" });
    expect(link).toHaveAttribute("data-router", "yes");
    expect(link).toHaveAttribute("href", "/nodes");
  });

  it("offers collapse and expand only when the host handles the mode", async () => {
    const onModeChange = vi.fn();
    const { rerender } = render(
      <Sidebar mode="full" onModeChange={onModeChange}>
        <SidebarHeader logo={<span>logo</span>} title="AuroraBoot" />
      </Sidebar>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onModeChange).toHaveBeenCalledWith("rail");
    rerender(
      <Sidebar mode="full">
        <SidebarHeader logo={<span>logo</span>} title="AuroraBoot" />
      </Sidebar>,
    );
    expect(screen.queryByRole("button", { name: "Collapse sidebar" })).toBeNull();
  });

  it("keeps unreached steps disabled and marks the current one", async () => {
    const onStepChange = vi.fn();
    render(
      <SidebarSteps
        steps={[
          { id: "a", label: "Device", state: "done" },
          { id: "b", label: "Network", state: "active" },
          { id: "c", label: "Review", state: "pending" },
        ]}
        current="b"
        onStepChange={onStepChange}
      />,
    );
    expect(screen.getByRole("button", { name: /Network/ })).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: /Network/ })).toHaveClass("scroll-my-0.5");
    expect(screen.getByRole("button", { name: /Review/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Device/ }));
    expect(onStepChange).toHaveBeenCalledWith("a");
  });

  it("renders the top bar brand as a link when given an href", () => {
    render(<Topbar href="/" logo={<span>logo</span>} title="Web Installer" />);
    expect(screen.getByRole("link", { name: /Web Installer/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("opens the drawer from the top bar and closes it on navigation", async () => {
    render(
      <AppShell
        title="AuroraBoot"
        sidebar={<Sidebar mode="full" />}
        drawer={
          <SidebarNav>
            <SidebarItem href="/nodes" icon={Server} label="Nodes" onClick={(e) => e.preventDefault()} />
          </SidebarNav>
        }
      >
        <p>content</p>
      </AppShell>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const dialog = screen.getByRole("dialog", { name: "AuroraBoot" });
    expect(dialog).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Nodes" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
