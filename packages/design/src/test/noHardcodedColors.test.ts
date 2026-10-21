import fs from "node:fs";
import path from "node:path";

// Every component, story and docs block must colour itself through the
// tokens: no hex literals and no Tailwind palette classes (bg-green-600),
// including white and black (text-white, bg-black/80): the ink on the orange
// accent is navy in the dark theme, so even white must come from a token.
// The Logo is the one exception, because the mark's fills are the brand.
const ROOTS = [path.resolve(__dirname, "../components"), path.resolve(__dirname, "../../.storybook/blocks")];
const ALLOWLIST = [/[/\\]components[/\\]Logo[/\\]/];

const HEX = /#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;
const PALETTE =
  /\b(?:bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|shadow|accent|caret|divide|placeholder)-(?:(?:red|green|blue|zinc|gray|slate|neutral|stone|orange|amber|yellow|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|white|black)(?:\/\d{1,3})?\b/;

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

describe("no hard-coded colours", () => {
  it("scans the component tree", () => {
    expect(collect(ROOTS[0]).length).toBeGreaterThan(0);
  });

  it("colours components through the tokens only", () => {
    const hits: string[] = [];
    for (const root of ROOTS) {
      for (const full of collect(root)) {
        if (ALLOWLIST.some((re) => re.test(full))) continue;
        const rel = path.relative(path.resolve(__dirname, "../.."), full);
        fs.readFileSync(full, "utf8")
          .split("\n")
          .forEach((line, i) => {
            if (HEX.test(line) || PALETTE.test(line)) hits.push(`${rel}:${i + 1}: ${line.trim()}`);
          });
      }
    }
    expect(hits, `hard-coded colours found:\n${hits.join("\n")}`).toEqual([]);
  });
});
