# Changelog

All notable changes to `@kairos-io/design`. The format is [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows [Semantic Versioning](https://semver.org/): a token value change or a prop removal is a major, a new token or component is a minor, a fix is a patch.

## [Unreleased]

### Changed

- The package moved into `kairos-io/design` as `packages/design`, next to the design decks, and merged with the tokens package that landed there (kairos-io/kairos#5511). `tokens.json` is now the only token source; `src/tokens/index.ts` is a typed view of it. The generator and the deck check are the repository's, extended with the status warning amber and the ink on a status fill, the terminal inks (`codeInk`, `codeMuted`), the dialog scrim (`overlay`), the 2 / 4 / 8 / full radius steps and the motion tokens. See ADR 0003.
- The design is the decks' (Tessellate). Urbanist and Martian Mono replace Noto Sans and ship self-hosted under `assets/fonts`, loaded by `fonts.css`; one violet neutral family replaces the slate and navy set; the radius is 4px with 2px for tags and 8px for dialogs; there are no shadows and the Tailwind `shadow-*` utilities are removed; ink on the accent is dark on Kairos orange and white on Hadron blue; links are `--link`.
- Components use the decks' token names: `bg`, `side`, `surface`, `inner`, `head`, `hover`, `raised`, `line`, `ink`, `sub`, `muted`, `accent`, `accentSoft`, `accentLine`, `onAccent`, `link`, `ok`, `warnBg`, `deep`, `code`, `codeBar`, `codeKey`. The AuroraBoot names (`background`, `card`, `muted-foreground`, `primary`, `sidebar-*`, `terminal-*`) are gone; the Adoption page lists the renames.
- The theme is `data-theme="light|dark"` on `<html>` (or any element), as the decks use it. `applyTheme`, `useTheme`, `ThemeToggle` and `inlineThemeScript()` set the attribute; the `light` and `dark` classes are no longer read.
- Hadron is `data-variant="hadron"`: the blue accent with white ink and the Hadron links in either theme. The tiles keep `palette="hadron"`.
- The Tailwind entry is `@kairos-io/design/tailwind.css` (it imports `tokens.css`); `theme.css` is gone. `tokens.css`, `tailwind.css` and `tokens.json` are exported from the package root as well as from `dist/`.
- The tones map onto the decks' status colours: success is `status-healthy` with `ok` ink, warning `status-warning`, danger `status-recovery`, info the accent with `link` ink, neutral `muted`. Badges and dots draw a diamond, as the decks do.
- The Storybook is published under `/storybook/` of the repository's Pages site, next to the decks, and the packed tarball under `/packages/design/` so a branch build can be installed with `npm install <url>`.

### Planned

- Radio cards (the installer's `.choice`), a skeleton loader, a Radix `Tooltip`, the fleet `Gauge` and `Sparkline`.
- Web Components over the same tokens, for non-React surfaces that need behaviour and not only styles.
- A second theme, for a design direction that differs from the shipped one (see ADR 0002).

## [0.1.0] - 2026-10-09

The first cut: the design the Kairos web projects already ship, as one package.

### Added

- Tokens: brand palette, semantic colours for light and dark, the five status tones, the Noto Sans and monospace stacks, a type scale, the 4px spacing scale, breakpoints, layout measures, radius, shadows and motion. One TypeScript source (`src/tokens`), generated into `tokens.css` and a Tailwind v4 `theme.css`, with tests that both themes and the OS-preference block agree.
- React components: Alert, Badge, Button, Card, Checkbox, Chip, Dialog and ConfirmDialog, EmptyState, Field, InfoTooltip, Input, Label, Logo (KairosMark, KairosLogo), PageHeader, SegmentedControl, Select, Separator, Sidebar and AppShell, StatTile, StatusBadge, StatusDot, Steps, Table, Tabs, Terminal, Textarea, ThemeToggle, Toast. The `useTheme` hook, `inlineThemeScript()`, `cn()`, `phaseTone()` and the tone class maps.
- `components.css`: the web installer's component classes over the tokens, for pages with no build step.
- Storybook with every component in both themes, accessibility checks, and the Foundations, Getting started and Adoption pages. Published to GitHub Pages.
- Examples: a React + Vite consumer, a plain HTML page, and a Go binary that embeds the stylesheets. CI installs the packed tarball into the React example and builds it.
- Tiles: the mark's rhombi laid flat. A pure geometry library (`src/lib/tiles.ts`: `tileField`, `tileHexagon`, `tileFieldSvg`, the fade presets), five components (`TileField`, `TileUnit`, `Tile`, `TileBar`, `TileMarker`) and five static SVG fields under `assets/patterns/` for pages with no build step. The shapes come from the Tessellate direction in `kairos-io/design-system` (October 2026) and paint with the `--brand-*` tokens. The Hadron blues (`--brand-hadron-sky` #1BAAFF, `--brand-hadron-blue` #0275E7, `--brand-hadron-deep` #004CCE, exported as `hadron`) are the second brand set from the same source; every tile component takes `palette="hadron"` and the pattern files ship in both palettes.

### Changed

- The toast tones use the status tokens instead of Tailwind's green and red, a deliberate change from AuroraBoot's toaster.
- `applyTheme` sets both `light` and `dark` on `<html>`, so an explicit choice beats the OS preference now that `tokens.css` follows `prefers-color-scheme` when neither class is present.
- Ink on the orange accent (the active sidebar item, the current wizard step, the pressed theme button) is `--primary-foreground`: white in light, navy in dark, because white on the dark theme's soft orange is 2.68:1.
- `--destructive-foreground` is navy in the dark theme and the destructive button uses it, because white on the dark danger red is 2.99:1.
- `--muted-foreground` in the light theme is #5b6879 instead of #64748b, so muted text on the muted surface (inactive tabs) reaches 5.18:1 instead of 4.34:1.
- Sidebar section and rail labels use a new `--sidebar-fg-muted` token (6.0:1 on navy) instead of the sidebar ink at 40% opacity (3.2:1).
- The current wizard step's marker shows its number in navy on white rather than in the accent orange, which did not pass on white.
- One `--overlay` token (black at 60%, 70% in dark) scrims the dialog, the navigation drawer and the vanilla `.backdrop`, where AuroraBoot used 80% and 60%.
- Dialogs open with the system's own fade-up animation; the tailwindcss-animate classes AuroraBoot used had no effect without that plugin.
- Every focus ring is 2px (`--shadow-focus`); AuroraBoot's buttons and inputs had 1px.
- `Badge` renders a `<span>`, so it can sit inside headings and table cells.
- `SidebarSteps` takes the same `{ id, label, state }` items as `Steps`.

- `SegmentedControl`: the group's name is now passed as `aria-label` (was `ariaLabel`), matching Steps and Terminal.
- `EmptyState`: `text` is now `description`, matching PageHeader, Checkbox and ConfirmDialog.
- `PageHeader`: `renderLink` is gone; a breadcrumb item takes an optional `element` (the host's router link) instead.
- `InfoTooltip`: the panel is a labelled disclosure (`aria-expanded`, `aria-controls`, `role="group"`) rather than `role="tooltip"`; Escape closes it; new `label`, `className` and `defaultOpen` props.
- `Toast` type renamed `ToastMessage` (`Toast` remains as a deprecated alias); `useToastListener` is no longer exported from the package root.
- `useTheme` renders "system" on the server and on the first client render, then reads the stored mode, so Docusaurus no longer hydrates with a mismatch. Storage-blocked browsers keep the choice in memory.
- `EmptyState`, `PageHeader`, `StatTile`, `MeterBar`, `StackBar`, `Steps`, `SegmentedControl` and `InfoTooltip` forward refs and spread HTML attributes.
- `Field` sets the native `required` attribute as well as `aria-required`.
- Every control uses the same 2px focus ring; the vanilla layer's `--shadow-focus` matches.
- The shipped `styles.css` no longer includes utilities used only by stories and tests.

[Unreleased]: https://github.com/kairos-io/design/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/kairos-io/design/releases/tag/v0.1.0
