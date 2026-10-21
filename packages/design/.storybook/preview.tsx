import type { Preview } from "@storybook/react-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { kairosDocsTheme } from "./theme.ts";
import "./preview.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: kairosDocsTheme,
      toc: true,
    },
    options: {
      storySort: {
        order: [
          "Introduction",
          "Getting started",
          "Foundations",
          [
            "Brand",
            "Hadron",
            "Color",
            "Typography",
            "Spacing & layout",
            "Radius, elevation & motion",
            "Theming",
            "Tiles",
            "Icons",
            "Naming",
          ],
          "Components",
          "Patterns",
          "Pages",
          "Adoption",
          "Changelog",
        ],
      },
    },
    a11y: {
      // Fail the a11y addon's checks instead of only reporting them.
      test: "error",
    },
  },
  decorators: [
    // tokens.css reads the theme from data-theme on <html>, as the decks and
    // the installer do. Light is the default; "system" leaves the attribute
    // off and follows prefers-color-scheme.
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
      parentSelector: "html",
    }),
  ],
  tags: ["autodocs"],
};

export default preview;
