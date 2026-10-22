import fs from "node:fs";
import path from "node:path";

// The inline script in .storybook/preview-head.html applies the toolbar
// globals from the preview URL before the bundle loads, so a page opened on
// ?globals=theme:dark never paints light first, and one opened on
// ?globals=motion:0.25 runs its entrance slowly from the first frame. It runs
// here against a fake location: the script only reads location.search, and
// runs with no storage and no matchMedia.
const head = fs.readFileSync(path.resolve(__dirname, "../../.storybook/preview-head.html"), "utf8");
const script = /<script>([\s\S]*?)<\/script>/.exec(head)?.[1] ?? "";

function run(search: string) {
  new Function("location", script)({ search });
  const root = document.documentElement;
  return {
    theme: root.getAttribute("data-theme"),
    variant: root.getAttribute("data-variant"),
    scale: root.style.getPropertyValue("--duration-scale"),
  };
}

describe("Storybook preview head", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-variant");
    document.documentElement.style.removeProperty("--duration-scale");
  });

  it("applies the theme and brand globals from the preview URL, as the manager encodes them", () => {
    expect(
      run("?id=pages-kairos-io-homepage--default&viewMode=story&globals=theme%3Adark%3Bbrand%3Ahadron"),
    ).toEqual({
      theme: "dark",
      variant: "hadron",
      scale: "1",
    });
    expect(run("?globals=theme:dark;brand:hadron")).toEqual({
      theme: "dark",
      variant: "hadron",
      scale: "1",
    });
  });

  it("applies the motion global as the scale every duration token is multiplied by", () => {
    expect(run("?globals=motion:0.25").scale).toBe("0.25");
    expect(run("?globals=theme:dark;motion:2").scale).toBe("2");
    // "off" is zero: the same end state as prefers-reduced-motion.
    expect(run("?globals=motion:off").scale).toBe("0");
  });

  it("defaults to light, Kairos and 1x, with no globals and with values it does not know", () => {
    expect(run("?id=foundations-tiles--docs&viewMode=docs")).toEqual({
      theme: "light",
      variant: null,
      scale: "1",
    });
    expect(run("?globals=theme:sideways;brand:acme;motion:sideways")).toEqual({
      theme: "light",
      variant: null,
      scale: "1",
    });
    expect(run("?globals=theme:light")).toEqual({ theme: "light", variant: null, scale: "1" });
  });

  it("paints the canvas in each theme's bg before the stylesheet arrives", () => {
    expect(head).toMatch(/html\s*\{[^}]*background:/);
    expect(head).toMatch(/html\[data-theme="dark"\]\s*\{[^}]*background:/);
  });
});
