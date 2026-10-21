import fs from "node:fs";
import path from "node:path";
import { brand, semanticDark, semanticLight, tones } from "../tokens/index.ts";

const tokensCss = fs.readFileSync(path.resolve(__dirname, "../styles/tokens.css"), "utf8");
const themeCss = fs.readFileSync(path.resolve(__dirname, "../styles/theme.css"), "utf8");

function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`no ${selector} block`);
  return css.slice(start, css.indexOf("}", start));
}

describe("design tokens", () => {
  it("defines every semantic token for both themes", () => {
    for (const name of Object.keys(semanticLight)) {
      expect(semanticDark).toHaveProperty(name);
    }
  });

  it.each(Object.keys(semanticLight))("maps --%s into the Tailwind theme and both CSS themes", (name) => {
    expect(block(tokensCss, ":root {\n  --background")).toContain(`--${name}:`);
    expect(block(tokensCss, ".dark,")).toContain(`--${name}:`);
    expect(themeCss).toContain(`--color-${name}: var(--${name});`);
  });

  it("uses the brand orange as the light primary and the soft orange in the dark theme", () => {
    expect(semanticLight.primary).toBe(brand.orange);
    expect(semanticDark.primary).toBe(brand.orangeSoft);
    expect(brand.orange.toLowerCase()).toBe("#ee5007");
  });

  it("keeps the generated CSS in step with the source", () => {
    // The system-preference block must carry the same dark values as .dark.
    const dark = block(tokensCss, ".dark,");
    const system = block(tokensCss, ":root:not(.light)");
    for (const [name, value] of Object.entries(semanticDark)) {
      expect(dark).toContain(`--${name}: ${value};`);
      expect(system).toContain(`--${name}: ${value};`);
    }
  });

  it.each(tones)("has a %s tone with a foreground in both themes", (tone) => {
    expect(semanticLight[tone]).toMatch(/^#/);
    expect(semanticLight[`${tone}-foreground`]).toMatch(/^#/);
    expect(semanticDark[tone]).toMatch(/^#/);
    expect(semanticDark[`${tone}-foreground`]).toMatch(/^#/);
  });
});
