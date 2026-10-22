import fs from "node:fs";
import path from "node:path";
import {
  brand,
  resolveTheme,
  status,
  themeDark,
  themeLight,
  themeTokens,
  toneTokens,
  tones,
  variants,
} from "../tokens/index.ts";

// tokens.json is the source; scripts/build.cjs writes these two files from it
// and scripts/check.cjs fails CI when they are stale. These tests pin the
// contract the components rely on.
const tokensCss = fs.readFileSync(path.resolve(__dirname, "../../tokens.css"), "utf8");
const tailwindCss = fs.readFileSync(path.resolve(__dirname, "../../tailwind.css"), "utf8");

function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`no ${selector} block`);
  return css.slice(start, css.indexOf("}", start));
}

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

describe("design tokens", () => {
  it("defines every theme token for both themes", () => {
    for (const name of themeTokens) {
      expect(themeDark).toHaveProperty(name);
      expect(themeLight[name]).toMatch(/^#[0-9A-Fa-f]{6,8}$/);
      expect(themeDark[name]).toMatch(/^#[0-9A-Fa-f]{6,8}$/);
    }
  });

  it.each(themeTokens)(
    "writes --%s into the light, dark and system blocks and the Tailwind theme",
    (name) => {
      expect(block(tokensCss, ':root,\n[data-theme="light"] {')).toContain(`--${name}: ${themeLight[name]};`);
      expect(block(tokensCss, '[data-theme="dark"] {')).toContain(`--${name}: ${themeDark[name]};`);
      expect(block(tokensCss, ':root:not([data-theme="light"]) {')).toContain(
        `--${name}: ${themeDark[name]};`,
      );
      expect(tailwindCss).toContain(`--color-${kebab(name)}: var(--${name});`);
    },
  );

  it("uses the Kairos orange as the light accent and the mid orange in the dark theme", () => {
    expect(themeLight.accent).toBe(brand["kairos-orange"]);
    expect(themeDark.accent).toBe(brand["kairos-mid"]);
    expect(brand["kairos-orange"].toUpperCase()).toBe("#EE5007");
  });

  it("puts dark ink on Kairos orange and white on Hadron blue", () => {
    expect(themeLight["on-accent"]).toBe(themeLight.ink);
    expect(variants.hadron.light.accent).toBe(brand["hadron-blue"]);
    expect(variants.hadron.light["on-accent"]).toBe("#FFFFFF");
    expect(variants.hadron.dark["on-accent"]).toBe("#FFFFFF");
  });

  it("writes every variant under data-variant in both themes", () => {
    for (const name of Object.keys(variants)) {
      expect(tokensCss).toContain(`[data-variant="${name}"] {`);
      expect(tokensCss).toContain(`[data-theme="dark"][data-variant="${name}"]`);
    }
  });

  it("exposes the brand and status colours as fixed Tailwind colours", () => {
    for (const [name, value] of Object.entries(brand)) {
      expect(tokensCss).toContain(`--${name}: ${value};`);
      expect(tailwindCss).toContain(`--color-${name}: ${value};`);
    }
    for (const [name, value] of Object.entries(status)) {
      expect(tokensCss).toContain(`--status-${name}: ${value};`);
      expect(tailwindCss).toContain(`--color-status-${name}: ${value};`);
    }
  });

  it.each(tones)("paints the %s tone with tokens that exist", (tone) => {
    const known = new Set([
      ...themeTokens.map(kebab),
      ...Object.keys(brand),
      ...Object.keys(status).map((s) => `status-${s}`),
    ]);
    expect(known.has(toneTokens[tone].fill)).toBe(true);
    expect(known.has(toneTokens[tone].ink)).toBe(true);
  });

  it("resolves a variant over a theme, name by name", () => {
    expect(resolveTheme("light")).toEqual(themeLight);
    expect(resolveTheme("dark")).toEqual(themeDark);
    const hadronLight = resolveTheme("light", "hadron");
    expect(hadronLight.accent).toBe(brand["hadron-blue"]);
    expect(hadronLight["on-accent"]).toBe("#FFFFFF");
    expect(hadronLight.link).toBe(variants.hadron.light.link);
    // Names the variant does not set keep the theme's value: these stay Kairos orange on purpose.
    expect(hadronLight["accent-soft"]).toBe(themeLight["accent-soft"]);
    expect(hadronLight["accent-line"]).toBe(themeLight["accent-line"]);
    expect(hadronLight["code-key"]).toBe(themeLight["code-key"]);
    expect(hadronLight.bg).toBe(themeLight.bg);
    const hadronDark = resolveTheme("dark", "hadron");
    expect(hadronDark.link).toBe(brand["hadron-sky"]);
    expect(hadronDark.bg).toBe(themeDark.bg);
    expect(resolveTheme("light", "console").line).toBe(variants.console.light.line);
    expect(resolveTheme("dark", "console").line).toBe(themeDark.line);
    // The result is a copy; the source is untouched.
    hadronLight.bg = "#000000";
    expect(themeLight.bg).not.toBe("#000000");
  });

  it("has no shadows and one radius family", () => {
    expect(tailwindCss).toContain("--shadow-*: initial;");
    expect(tailwindCss).toContain("--radius-base: 4px;");
    expect(tokensCss).toContain("--radius-base: 4px;");
  });
});
