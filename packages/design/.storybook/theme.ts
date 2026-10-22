import { create } from "storybook/theming";

// The Storybook chrome in the system's own colours: the light theme's canvas,
// surface, hairline and inks from tokens.json, and the Kairos orange as the
// accent. The docs pages follow the page theme through tokens.css; this only
// styles the manager and the docs frame.
const shared = {
  brandTitle: "Kairos design system",
  brandUrl: "https://kairos.io",
  brandTarget: "_self" as const,
  fontBase:
    "Urbanist, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'DejaVu Sans', sans-serif",
  fontCode:
    "'Martian Mono', ui-monospace, 'SF Mono', Menlo, 'Cascadia Mono', Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Noto Sans Mono', monospace",
  colorPrimary: "#EE5007",
  colorSecondary: "#EE5007",
  appBorderRadius: 4,
  inputBorderRadius: 4,
};

export const kairosManagerTheme = create({
  base: "light",
  ...shared,
  brandImage: "./logos/kairos-horizontal-color.svg",
  appBg: "#F2F1F5",
  appContentBg: "#FFFFFF",
  appPreviewBg: "#FFFFFF",
  appBorderColor: "#D8D5E0",
  textColor: "#1C1B24",
  textMutedColor: "#5C596A",
  barTextColor: "#5C596A",
  barSelectedColor: "#EE5007",
  barHoverColor: "#A33600",
  barBg: "#FFFFFF",
  inputBg: "#FFFFFF",
  inputBorder: "#D8D5E0",
  inputTextColor: "#1C1B24",
});

export const kairosDocsTheme = create({
  base: "light",
  ...shared,
  brandImage: "./logos/kairos-horizontal-color.svg",
});
