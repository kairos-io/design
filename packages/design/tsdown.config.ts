import { defineConfig } from "tsdown";

// The library build: ESM only, React left to the host app, types alongside.
// CSS is built separately by scripts/build-css.ts.
export default defineConfig({
  entry: {
    index: "src/index.ts",
    tokens: "src/tokens/index.ts",
    // Its own entry: CodeMirror is ~100 KB gzipped, and only an editor page
    // should load it. Nothing in index.ts imports it.
    "code-editor": "src/components/CodeEditor/index.ts",
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
