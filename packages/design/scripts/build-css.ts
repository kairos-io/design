// Builds every stylesheet the package ships into dist/ and copies the logo
// assets. Run after build:tokens.
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

for (const name of ["tokens.css", "theme.css", "fonts.css", "components.css"]) {
  copyFileSync(resolve(root, "src/styles", name), resolve(dist, name));
}
cpSync(resolve(root, "src/assets"), resolve(dist, "assets"), { recursive: true });
console.log("wrote dist/styles.css, tokens.css, theme.css, fonts.css, components.css and assets/");
