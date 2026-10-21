import { create } from "storybook/theming";

// The Storybook chrome in Kairos colours. The docs pages follow the page
// theme through tokens.css; this only styles the manager and docs frame.
const shared = {
  brandTitle: "Kairos design system",
  brandUrl: "https://kairos.io",
  brandTarget: "_self" as const,
  fontBase: '"Noto Sans", ui-sans-serif, system-ui, sans-serif',
  fontCode: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  colorPrimary: "#EE5007",
  colorSecondary: "#EE5007",
  appBorderRadius: 8,
  inputBorderRadius: 6,
};

export const kairosManagerTheme = create({
  base: "light",
  ...shared,
  brandImage: "./logos/kairos-horizontal-color.svg",
  appBg: "#f1f5f9",
  appContentBg: "#ffffff",
  appPreviewBg: "#ffffff",
  appBorderColor: "#e2e8f0",
  textColor: "#0f172a",
  textMutedColor: "#64748b",
  barTextColor: "#64748b",
  barSelectedColor: "#EE5007",
  barHoverColor: "#FF7442",
  barBg: "#ffffff",
  inputBg: "#ffffff",
  inputBorder: "#e2e8f0",
  inputTextColor: "#0f172a",
});

export const kairosDocsTheme = create({
  base: "light",
  ...shared,
  brandImage: "./logos/kairos-horizontal-color.svg",
});
