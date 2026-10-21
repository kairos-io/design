import type { Preview } from "@storybook/react-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
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
            "Color",
            "Typography",
            "Spacing & layout",
            "Radius, shadows & motion",
            "Theming",
            "Icons",
          ],
          "Components",
          "Patterns",
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
    withThemeByClassName({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      parentSelector: "html",
    }),
  ],
  tags: ["autodocs"],
};

export default preview;
