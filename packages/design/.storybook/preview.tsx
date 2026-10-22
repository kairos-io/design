import type { Decorator, Preview } from "@storybook/react-vite";
import { DecoratorHelpers } from "@storybook/addon-themes";
import { addons } from "storybook/preview-api";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { applyBrand, applyTheme, isBrand, type Brand } from "../src/lib/theme.ts";
import { kairosDocsTheme } from "./theme.ts";
import "./preview.css";

// The Theme toolbar sets data-theme on the preview <html>, which tokens.css
// reads as the decks and the installer do, and the Brand toolbar sets
// data-variant="hadron" the way a Hadron page does once at its root. Light is
// the default: "system" would leave the attribute off and follow the OS, which
// the toolbar cannot show.
//
// The toolbar is addon-themes' (registered here); the attribute is ours. The
// addon's own decorator sets it in an effect, after the story has painted, so
// a page opened on ?globals=theme:dark painted light first. Here it is set
// while the story renders, before React commits, and preview-head.html sets
// it before the bundle even loads. Docs-only pages run no decorator, so the
// globals channel sets both attributes for them.
const themes = { light: "light", dark: "dark" } as const;
DecoratorHelpers.initializeThemeState(Object.keys(themes), "light");

function setTheme(value: unknown) {
  applyTheme(value === "dark" ? "dark" : "light");
}
function setBrand(value: unknown) {
  applyBrand(isBrand(value) ? value : "kairos");
}
addons.getChannel().on(GLOBALS_UPDATED, ({ globals }: { globals: Record<string, unknown> }) => {
  setTheme(globals.theme);
  setBrand(globals.brand);
});

const withThemeAndBrand: Decorator = (Story, context) => {
  setTheme(DecoratorHelpers.pluckThemeFromContext(context));
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
  decorators: [withThemeAndBrand],
  tags: ["autodocs"],
};

export default preview;
