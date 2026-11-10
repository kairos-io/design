// Writes the tile fields as standalone SVG files under src/assets/patterns,
// for pages with no build step (background-image or <img>). The React
// TileField renders the same geometry from src/lib/tiles.ts.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tileFades, tileFieldSvg } from "../src/lib/tiles.ts";

const out = resolve(dirname(fileURLToPath(import.meta.url)), "../src/assets/patterns");
mkdirSync(out, { recursive: true });

const files: Record<string, Parameters<typeof tileFieldSvg>[0]> = {
  "tile-field-right": { width: 700, height: 460, radius: 38, seed: 5, bias: tileFades.right },
  "tile-field-left": { width: 700, height: 460, radius: 38, seed: 5, bias: tileFades.left },
  "tile-field-top-right": { width: 700, height: 460, radius: 38, seed: 9, bias: tileFades.topRight },
  "tile-field-wide": { width: 1040, height: 460, radius: 64, seed: 5, bias: tileFades.right },
  "tile-unit": { width: 110, height: 128, radius: 64, seed: 1, solid: true },
};

let count = 0;
for (const [name, options] of Object.entries(files)) {
  writeFileSync(resolve(out, `${name}.svg`), tileFieldSvg(options));
  writeFileSync(
    resolve(out, `${name.replace("tile-", "hadron-tile-")}.svg`),
    tileFieldSvg(options, { palette: "hadron" }),
  );
  count += 2;
}
console.log(`wrote ${count} tile patterns to src/assets/patterns`);
