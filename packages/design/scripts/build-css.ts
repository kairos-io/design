// Builds every stylesheet the package ships into dist/ and copies the assets
// (logos, tile patterns, fonts). Run after build:tokens.
import { execFileSync } from "node:child_process";
import { copyFileSync, cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
mkdirSync(dist, { recursive: true });

const tailwind = resolve(root, "node_modules/.bin/tailwindcss");
execFileSync(tailwind, ["-i", "src/styles/index.css", "-o", "dist/styles.css", "--minify"], {
  cwd: root,
  stdio: "inherit",
});

// The generated token files live at the package root (the decks and the
// Pages site read them there); a copy in dist/ keeps the CDN path stable.
for (const name of ["tokens.css", "tailwind.css"]) {
  copyFileSync(resolve(root, name), resolve(dist, name));
}
for (const name of ["fonts.css", "components.css"]) {
  copyFileSync(resolve(root, "src/styles", name), resolve(dist, name));
}
cpSync(resolve(root, "src/assets"), resolve(dist, "assets"), { recursive: true });
console.log("wrote dist/styles.css, tokens.css, tailwind.css, fonts.css, components.css and assets/");
