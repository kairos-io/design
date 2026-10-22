// @vitest-environment node
//
// The package is imported by servers too (Docusaurus, a Next.js site): the
// barrel must not touch window, document, matchMedia or localStorage at import
// time, and a component must render to a string without a DOM. This file runs
// in a plain Node environment, so any top-level access throws a ReferenceError
// here before it can on a host's server.
import { renderToString } from "react-dom/server";

describe("@kairos-io/design without a DOM", () => {
  it("runs where window and document do not exist", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });

  it("imports the barrel at the top level without touching the browser", async () => {
    const design = await import("../index.ts");
    expect(Object.keys(design).length).toBeGreaterThan(100);
    // forwardRef components are exotic objects, plain function components are functions.
    expect(design.Button).toBeTruthy();
    expect(typeof design.useTheme).toBe("function");
    expect(design.inlineThemeScript()).toContain("data-theme");
  });

  it("reads the theme helpers as 'system' and light with no storage and no matchMedia", async () => {
    const { getStoredTheme, systemPrefersDark, resolveTheme, createTheme, applyBrand, getBrand } =
      await import("../index.ts");
    expect(getStoredTheme()).toBe("system");
    expect(systemPrefersDark()).toBe(false);
    expect(resolveTheme("system")).toBe("light");
    // The writers have no <html> to write to and do nothing instead of throwing.
    expect(() => createTheme().set("dark")).not.toThrow();
    expect(() => createTheme().apply()).not.toThrow();
    expect(() => applyBrand("hadron")).not.toThrow();
    expect(getBrand()).toBe("kairos");
  });

  it("renders the interactive and theme-aware components to a string", async () => {
    const d = await import("../index.ts");
    const html = renderToString(
      <div>
        <d.Button>Download ISO</d.Button>
        <d.ThemeToggle />
        <d.SegmentedControl
          aria-label="Architecture"
          value="amd64"
          onChange={() => {}}
          options={[
            { value: "amd64", label: "amd64" },
            { value: "arm64", label: "arm64" },
          ]}
        />
        <d.Tabs defaultValue="overview">
          <d.TabsList>
            <d.TabsTrigger value="overview">Overview</d.TabsTrigger>
            <d.TabsTrigger value="log">Log</d.TabsTrigger>
          </d.TabsList>
          <d.TabsContent value="overview">node-01</d.TabsContent>
        </d.Tabs>
        <d.Select defaultValue="ubuntu">
          <d.SelectTrigger aria-label="Base image">
            <d.SelectValue />
          </d.SelectTrigger>
          <d.SelectContent>
            <d.SelectItem value="ubuntu">Ubuntu 24.04</d.SelectItem>
          </d.SelectContent>
        </d.Select>
        <d.Switch checked label="Secure boot" />
        <d.FilterChip selected>Healthy</d.FilterChip>
        <d.CommandSample command="kairos upgrade" />
        <d.Terminal aria-label="Installation log" lines={["Writing image to /dev/sda", "Done"]} />
        <d.TileField />
        <d.Hero title="The immutable Linux for the edge" />
        <d.Slide>
          <d.SlideTitle title="Kairos" event="KubeCon" speaker="Mauro" affiliation="Spectro Cloud" />
        </d.Slide>
        <d.Toaster />
      </div>,
    );
    expect(html).toContain("Download ISO");
    expect(html).toContain("kairos upgrade");
    expect(html).toContain("<svg");
  });
});
