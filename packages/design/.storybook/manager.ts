import { addons } from "storybook/manager-api";
import { kairosManagerTheme } from "./theme.ts";

addons.setConfig({
  theme: kairosManagerTheme,
  sidebar: {
    showRoots: true,
  },
});
