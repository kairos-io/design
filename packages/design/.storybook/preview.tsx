import type { Decorator, Preview } from "@storybook/react-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { addons } from "storybook/preview-api";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { applyBrand, isBrand, type Brand } from "../src/lib/theme.ts";
import { kairosDocsTheme } from "./theme.ts";
import "./preview.css";

// The Brand toolbar sets data-variant="hadron" on the preview <html>, the
// way a Hadron page does once at its root. Stories get it from the decorator;
// docs-only pages run no decorators, so the globals channel sets it for them.
function setBrand(value: unknown) {
  applyBrand(isBrand(value) ? value : "kairos");
}
addons.getChannel().on(GLOBALS_UPDATED, ({ globals }: { globals: Record<string, unknown> }) => {
  setBrand(globals.brand);
});

const withBrand: Decorator = (Story, context) => {
  setBrand(context.globals.brand);
  return Story();
};

const preview: Preview = {
  globalTypes: {
    brand: {
      description: 'Kairos, or Hadron: the same system with the blue accent (data-variant="hadron")',
      toolbar: {
        title: "Brand",
        icon: "paintbrush",
        items: [
          { value: "kairos", title: "Kairos" },
          { value: "hadron", title: "Hadron" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    brand: "kairos" satisfies Brand,
  },
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
    withBrand,
  ],
  tags: ["autodocs"],
};

export default preview;
