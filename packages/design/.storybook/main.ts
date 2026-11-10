import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import remarkGfm from "remark-gfm";

// The Storybook is viewed from other devices over the LAN and Tailscale. The
// dev server already listens on every interface and accepts an IP address in
// the URL, but a hostname gets "Invalid host" (403) and the preview fails to
// load. These suffixes cover Tailscale MagicDNS, mDNS and the usual home
// network names; STORYBOOK_ALLOWED_HOSTS adds more as a comma-separated list,
// or "true" to accept every host (what `--host 0.0.0.0` does).
function allowedHosts(): string[] | true {
  const env = process.env.STORYBOOK_ALLOWED_HOSTS?.trim();
  if (env === "true") return true;
  const extra = env
    ? env
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
    : [];
  return [".ts.net", ".local", ".lan", ".home.arpa", ".internal", ...extra];
}

const config: StorybookConfig = {
  stories: ["../src/docs/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    // Storybook no longer bundles GFM; Naming.mdx uses pipe tables, so wire remark-gfm in explicitly.
    {
      name: "@storybook/addon-docs",
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../src/assets"],
  core: { disableTelemetry: true, allowedHosts: allowedHosts() },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
