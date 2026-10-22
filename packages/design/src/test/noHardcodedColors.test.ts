import fs from "node:fs";
import path from "node:path";

// Every component, story and docs block must colour itself through the
// tokens: no hex literals and no Tailwind palette classes (bg-green-600),
// including white and black (text-white, bg-black/80): the ink on the accent
// is dark on Kairos orange and white on Hadron blue, so even white must come
// from a token (on-accent, status-ink). The Logo is the one exception,
// because the mark's fills are the brand.
//
// A component also never names a brand colour (bg-kairos-orange,
// text-hadron-blue): it goes through accent, on-accent, accent-soft,
// accent-line and link, so that data-variant="hadron" can swap them. The
// tiles and the logo are the brand itself and are the exceptions; the
// Foundations docs show the palettes by name.
const ROOTS = [path.resolve(__dirname, "../components"), path.resolve(__dirname, "../../.storybook/blocks")];
const ALLOWLIST = [/[/\\]components[/\\]Logo[/\\]/];
const BRAND_ALLOWLIST = [
  /[/\\]components[/\\]Logo[/\\]/,
  /[/\\]components[/\\]Tiles[/\\]/,
  /[/\\]blocks[/\\]/,
];

const HEX = /#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;
const UTILITY =
  "bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|shadow|accent|caret|divide|placeholder";
const PALETTE = new RegExp(
  `\\b(?:${UTILITY})-(?:(?:red|green|blue|zinc|gray|slate|neutral|stone|orange|amber|yellow|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}|white|black)(?:\\/\\d{1,3})?\\b`,
);
const BRAND = new RegExp(
  `\\b(?:${UTILITY})-(?:kairos|hadron)-(?:light|mid|orange|sky|blue|deep)(?:\\/\\d{1,3})?\\b`,
);
const BRAND_VAR = /var\(--(?:kairos|hadron)-(?:light|mid|orange|sky|blue|deep)\b/;

function collect(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collect(full));
    else if (/\.(tsx?|mdx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function scan(allow: RegExp[], test: (line: string) => boolean): string[] {
  const hits: string[] = [];
  for (const root of ROOTS) {
    for (const full of collect(root)) {
      if (allow.some((re) => re.test(full))) continue;
      const rel = path.relative(path.resolve(__dirname, "../.."), full);
      fs.readFileSync(full, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (test(line)) hits.push(`${rel}:${i + 1}: ${line.trim()}`);
        });
    }
  }
  return hits;
}

describe("no hard-coded colours", () => {
  it("scans the component tree", () => {
    expect(collect(ROOTS[0]).length).toBeGreaterThan(0);
  });

  it("colours components through the tokens only", () => {
    const hits = scan(ALLOWLIST, (line) => HEX.test(line) || PALETTE.test(line));
    expect(hits, `hard-coded colours found:\n${hits.join("\n")}`).toEqual([]);
  });

  it("keeps brand colours out of components, so the Hadron variant can swap the accent", () => {
    const hits = scan(BRAND_ALLOWLIST, (line) => BRAND.test(line) || BRAND_VAR.test(line));
    expect(
      hits,
      `brand colours named in components (use accent, on-accent, link):\n${hits.join("\n")}`,
    ).toEqual([]);
  });
});
