import { defineConfig } from "tsdown";

// The library build: ESM only, React left to the host app, types alongside.
// CSS is built separately by scripts/build-css.ts.
export default defineConfig({
  entry: {
    index: "src/index.ts",
    tokens: "src/tokens/index.ts",
  },
  format: ["esm"],
  platform: "browser",
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  target: "es2022",
  deps: { neverBundle: ["react", "react-dom", "react/jsx-runtime"] },
});
