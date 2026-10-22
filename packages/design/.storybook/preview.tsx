import type { Decorator, Preview } from "@storybook/react-vite";
import { DecoratorHelpers } from "@storybook/addon-themes";
import { addons } from "storybook/preview-api";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { setMotionScale } from "../src/lib/motion.ts";
import { applyBrand, applyTheme, isBrand, type Brand } from "../src/lib/theme.ts";
import { kairosDocsTheme } from "./theme.ts";
import "./preview.css";

// The Theme toolbar sets data-theme on the preview <html>, which tokens.css
// reads as the decks and the installer do, and the Brand toolbar sets
// data-variant="hadron" the way a Hadron page does once at its root. Light is
// the default: "system" would leave the attribute off and follow the OS, which
// the toolbar cannot show. The Motion toolbar sets --duration-scale, which
// every duration token is multiplied by, so a review can watch an entrance at
// a quarter speed or stop it; prefers-reduced-motion still wins over it.
//
// The toolbar is addon-themes' (registered here); the attribute is ours. The
// addon's own decorator sets it in an effect, after the story has painted, so
// a page opened on ?globals=theme:dark painted light first. Here it is set
// while the story renders, before React commits, and preview-head.html sets
// it before the bundle even loads. Docs-only pages run no decorator, so the
// globals channel applies all three for them.
const themes = { light: "light", dark: "dark" } as const;
DecoratorHelpers.initializeThemeState(Object.keys(themes), "light");

function setTheme(value: unknown) {
  applyTheme(value === "dark" ? "dark" : "light");
}
function setBrand(value: unknown) {
  applyBrand(isBrand(value) ? value : "kairos");
}
// "off" pins the scale at zero, which is the end state reduced motion gives:
// every duration resolves to 0ms and nothing moves. The default is 1.
const motionScales: Record<string, number> = { "0.25": 0.25, "0.5": 0.5, "1": 1, "2": 2, off: 0 };
function setMotion(value: unknown) {
  setMotionScale(motionScales[String(value)] ?? 1);
}
addons.getChannel().on(GLOBALS_UPDATED, ({ globals }: { globals: Record<string, unknown> }) => {
  setTheme(globals.theme);
  setBrand(globals.brand);
  setMotion(globals.motion);
});

const withThemeBrandAndMotion: Decorator = (Story, context) => {
  setTheme(DecoratorHelpers.pluckThemeFromContext(context));
  setBrand(context.globals.brand);
  setMotion(context.globals.motion);
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
    motion: {
      description: "How fast the motion tokens run, to inspect an animation slowly (--duration-scale)",
      toolbar: {
        title: "Motion",
        icon: "time",
        items: [
          { value: "0.25", title: "0.25x" },
          { value: "0.5", title: "0.5x" },
          { value: "1", title: "1x" },
          { value: "2", title: "2x" },
          { value: "off", title: "Off" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    brand: "kairos" satisfies Brand,
    motion: "1",
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
  decorators: [withThemeBrandAndMotion],
  tags: ["autodocs"],
};

export default preview;
