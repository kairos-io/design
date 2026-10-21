# @kairos-io/design

The Kairos design system as code: the design tokens, React components, framework-free styles and a Storybook that the Kairos web projects share. The design is the one drawn in the decks of this repository ([kairos-io/design](https://github.com/kairos-io/design)); `tokens.json` in this directory is the single source both the decks and the package read, and a check fails when they disagree. It answers [kairos-io/kairos#5083](https://github.com/kairos-io/kairos/issues/5083): the tokens are #5511, the components and this Storybook are #5512.

**Storybook:** https://kairos-io.github.io/design/storybook/ (every component in light, dark and Hadron, the foundations, and the decks' screens as live pages). **Decks:** https://kairos-io.github.io/design/.

## Install

From the npm registry, once the maintainers publish it (see Releasing):

```sh
npm install @kairos-io/design
```

Until then, or to try a branch, every Pages build of this repository serves the packed package next to the Storybook. A fork serves its own at the same path.

```sh
npm install https://kairos-io.github.io/design/packages/design/kairos-io-design.tgz
```

Each GitHub release of a `vX.Y.Z` tag also carries the tarball as an asset, pinned to that version:

```sh
npm install https://github.com/kairos-io/design/releases/download/v0.1.0/kairos-io-design-0.1.0.tgz
```

ESM only. React 18 or 19 is a peer dependency for the components. The stylesheets have no dependencies. From a checkout of this repository, the CSS files can be used by relative path (`./packages/design/tokens.css`) with no install at all.

## Use it

Pick the block that matches your project. Each one has a working copy under `examples/`.

**A React app** ([examples/react-vite](examples/react-vite)): import the compiled stylesheet and the fonts once and use the components.

```tsx
import "@kairos-io/design/styles.css";
import "@kairos-io/design/fonts.css";
import { Button, StatusBadge } from "@kairos-io/design";

<Button>Download ISO</Button>
<StatusBadge status="Healthy" />
```

**A React app that runs Tailwind v4** (the Kairos console): import the Tailwind theme instead of the compiled CSS (it imports `tokens.css`), and let Tailwind scan the package.

```css
@import "tailwindcss";
@import "@kairos-io/design/tailwind.css";
@source "../node_modules/@kairos-io/design/dist";
```

**Docusaurus** (the docs site): keep Infima, take the tokens and the fonts, and map Infima's variables onto them.

```css
/* src/css/custom.css */
@import "@kairos-io/design/tokens.css";
@import "@kairos-io/design/fonts.css";
:root {
  --ifm-color-primary: var(--accent);
  --ifm-font-family-base: var(--font-sans);
}
```

**A page with no build step** ([examples/plain-html](examples/plain-html)): the tokens plus the installer's class names, from the npm package or from a CDN.

```html
<link rel="stylesheet" href="node_modules/@kairos-io/design/tokens.css" />
<link rel="stylesheet" href="node_modules/@kairos-io/design/dist/components.css" />
<!-- or, with no npm at all: -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@kairos-io/design/dist/tokens.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@kairos-io/design/dist/components.css" />

<button class="btn">Install</button>
<span class="badge tone-success">Healthy</span>
```

**A Go binary that embeds its UI** ([examples/go-embed](examples/go-embed)), as the Kairos Installer does: vendor the files and `go:embed` them.

```go
//go:embed tokens.css components.css index.html
var assets embed.FS
http.Handle("/", http.FileServer(http.FS(assets)))
```

The React components are React only. Every other framework, and every page without a framework, consumes the CSS layer: `tokens.css` for the values and `components.css` for the classes.

## What is in the package

| Path                                      | Contents                                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `@kairos-io/design`                       | The React components (including the tiles), `useTheme`, `applyTheme`, `cn()`, `phaseTone()` and the tone maps.      |
| `@kairos-io/design/tokens`                | The tokens as typed JavaScript objects (a view of `tokens.json`), for charts and config.                            |
| `@kairos-io/design/tokens.json`           | The source of truth: brand, status, the light and dark themes, the variants, type, space, radius, motion.           |
| `@kairos-io/design/tokens.css`            | The custom properties: light is the default, dark under `data-theme="dark"` or the OS setting, plus the variants.   |
| `@kairos-io/design/tailwind.css`          | The Tailwind v4 `@theme` over the tokens. Imports `tokens.css`. Removes the default radius and shadow utilities.    |
| `@kairos-io/design/styles.css`            | Tailwind preflight and the utilities the components use, the tokens, the theme and a small base, in cascade layers. |
| `@kairos-io/design/components.css`        | The framework-free component classes over the tokens, under the installer's names.                                  |
| `@kairos-io/design/fonts.css`             | Urbanist and Martian Mono, self-hosted from `assets/fonts`. Optional; no third-party request.                       |
| `@kairos-io/design/assets/logos/*.svg`    | The Kairos artwork: icon, horizontal and stacked, in colour, white and black.                                       |
| `@kairos-io/design/assets/patterns/*.svg` | The tile fields and the tile unit as static SVG, in the Kairos and the Hadron palette.                              |

## The tokens

`tokens.json` is in the [W3C Design Tokens](https://tr.designtokens.org/format/) (DTCG) format: a token is `{ "$value": "#EE5007", "$type": "color" }`, a group holds tokens and may carry the `$type` they inherit, and a `"{color.brand.kairos-orange}"` value is an alias. So `themes.light.accent` says it is the Kairos orange, and the Hadron variant's `on-accent` says it is white. Style Dictionary, Terrazzo and Tokens Studio read the format; `scripts/build.cjs` reads it with no dependencies and writes `tokens.css`, `tailwind.css` and `src/tokens/resolved.json`, the plain view that `@kairos-io/design/tokens` exports.

The decks in this repository read `tokens.css` directly: each links `packages/design/tokens.css`, paints with `var(--token)` and switches theme with `data-theme`. The variable names are the ones the decks use, with no prefix: `--bg`, `--surface`, `--raised`, `--line`, `--ink`, `--sub`, `--muted`, `--accent`, `--on-accent`, `--link`, `--ok`, `--code`. Check for a clash before you add `tokens.css` to a page that has its own `--bg` or `--line`.

| Group         | Tokens                                                                                                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand colors  | `kairos-light` #FB9E70, `kairos-mid` #FF7442, `kairos-orange` #EE5007, `hadron-sky` #1BAAFF, `hadron-blue` #0275E7, `hadron-deep` #004CCE                                                                                                                         |
| Status colors | `status-healthy` #2F8F57, `status-warning` #E9A23B, `status-recovery` #C62B2B, `status-ink` #FFFFFF                                                                                                                                                               |
| Theme colors  | `bg` `side` `surface` `inner` `head` `hover` `raised` `line` `ink` `sub` `muted` `accent` `accent-soft` `accent-line` `on-accent` `link` `ok` `warn-bg` `deep` `code` `code-bar` `code-key` `code-ink` `code-muted` `overlay`, each with a light and a dark value |
| Fonts         | `--font-sans` (Urbanist), `--font-mono` (Martian Mono), weights 400, 600, 700                                                                                                                                                                                     |
| Type scale    | display 84, h1 56, h2 40, h3 24, body-lg 19, body 16, label 14, mono 13 px; text is never smaller than 12px                                                                                                                                                       |
| Spacing       | 4, 8, 12, 16, 24, 32, 48, 80 px as `--space-4` to `--space-80`; the Tailwind step is 4px                                                                                                                                                                          |
| Radius        | `--radius-sm` 2px (tags), `--radius-base` 4px, `--radius-lg` 8px (dialogs), `--radius-full`                                                                                                                                                                       |
| Shadow        | none; elevation is a tone step, canvas to surface to raised                                                                                                                                                                                                       |
| Motion        | `--ease-out`, `--duration-fast` 150ms, `--duration-base` 200ms, `--duration-slow` 360ms; all 0ms under `prefers-reduced-motion`                                                                                                                                   |
| Layout        | `--page-max` 1280px                                                                                                                                                                                                                                               |

**Theme.** Light is the default. Set `data-theme="light"` or `data-theme="dark"` on `<html>` (or on any element, to theme a part of the page). When `data-theme` is not set, the system setting decides. `useTheme`, `ThemeToggle`, `applyTheme` and `inlineThemeScript()` manage the attribute in React apps and plain pages.

**Variants.** A few screens change a few values. Set `data-variant="hadron"`, `"console"`, `"site"`, `"installer"` or `"foundations"` on the element that carries `data-theme`, or below it. Most projects need only `hadron`: the Hadron blue accent with white text on it (`--on-accent`) and the Hadron link colors. `hadron` does not change `--accent-line`, `--accent-soft` or `--code-key`; they stay Kairos orange because no deck defines Hadron values for them. One limit: a `data-theme="light"` section nested inside a dark section applies the dark variant values to a `data-variant` element below that light section; put `data-variant` on the light section itself in that case. The `description` of each variant in `tokens.json` says which decks use it.

**Tailwind.** Theme colors (`bg-bg`, `bg-surface`, `text-ink`, `text-sub`, `border-line`, `bg-accent`, `text-on-accent`, `text-link`, `text-ok`, ...) follow light and dark by themselves. Brand and status colors do not change with the theme: `kairos-orange`, `hadron-blue`, `status-healthy`. The type scale is `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-label`, `text-mono`, each setting size, weight and tracking. The radius utilities are `rounded-sm`, `rounded-base`, `rounded-lg` and `rounded-full`; the shadow utilities are removed. The default Tailwind colors are still there; add `--color-*: initial;` in your own `@theme` if you want only the Kairos colors.

**Contrast on Hadron.** White on `hadron-blue` #0275E7 is 4.47:1, just under the WCAG AA 4.5:1 for normal-size text. `bg-accent text-on-accent` under the `hadron` variant is fine for large or bold text but not for small buttons; use `bg-hadron-deep text-status-ink` (#004CCE, 7.18:1) there. Ink on Kairos orange is 4.70:1.

### Change a token

1. Edit `tokens.json`: the `$value` of the token, or a new token in its group (a theme colour needs a value under both `themes.light` and `themes.dark`; a variant lists only the names it changes).
2. Run `npm run build` here (or at the repository root). It rewrites `tokens.css`, `tailwind.css` and `src/tokens/resolved.json`.
3. Run `npm run check:tokens`.
4. Commit the four files together.

The decks pick the new value up through `tokens.css`; nothing in a deck is edited. The check fails when a deck uses a hex colour that is not a token, a `var(--name)` that `tokens.css` does not define, a theme map of its own, a missing link to `tokens.css`, or a `data-variant` it is not listed for in `scripts/check.cjs`; and when the generated files are not what the build would write now. It runs in CI (`.github/workflows/tokens.yml` and `ci.yml`) and needs only Node, no install. The few colours the decks use that are not a clear token yet are listed under `$extensions` → `untokenised` in `tokens.json`; they are not written to the CSS, and each is a decision for the designers.

## Develop

```sh
cd packages/design
npm ci
npm run storybook        # Storybook on http://localhost:6006
npm test                 # vitest: tokens, contrast, no hard-coded colours, every component
npm run build            # tokens, logos and patterns, then dist/ (JS, types, CSS, assets)
npm run build-storybook  # storybook-static/
```

Components follow [docs/CONVENTIONS.md](docs/CONVENTIONS.md). See [CONTRIBUTING.md](CONTRIBUTING.md). The decisions are in [docs/adr/](docs/adr/).

```
tokens.json            the token source, shared with the decks
tokens.css, tailwind.css   generated by scripts/build.cjs; scripts/check.cjs keeps them and the decks in step
src/tokens/            the typed view of tokens.json
src/styles/            base.css, components.css, fonts.css, the dist entry
src/components/        one directory per component: code, stories, tests (Tiles holds the tile pattern)
src/pages/             the decks' screens, built from the components
src/lib/, src/hooks/   cn, tones, tile geometry, theme helpers, useTheme
src/assets/            the logos, the fonts and the generated tile patterns
src/docs/              the Storybook foundation pages (MDX)
.storybook/            Storybook config and the docs blocks
scripts/               token, CSS, logo and pattern generators
examples/              one consumer per way of using the package
docs/adr/              decisions
```

## Publishing the Storybook

`.github/workflows/pages.yml` builds this package and its Storybook on every push to `main` and publishes the repository's Pages site: the decks at the root, the Storybook under `/storybook/`, and the packed tarball under `/packages/design/`. One-time setting: **Settings > Pages > Build and deployment > Source: GitHub Actions**. To publish a branch, allow it on the `github-pages` environment (Settings > Environments) and run the workflow on that branch from the Actions tab.

## Releasing

1. Open a pull request that bumps `version` in `package.json` and moves the Unreleased entries in `CHANGELOG.md` under the version. Merge it.
2. Tag the merge commit and push the tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. `.github/workflows/release.yml` runs the checks, fails if the tag does not match the version, creates the GitHub release with the tarball attached, and publishes to npm with provenance.

npm uses trusted publishing (OIDC), so the workflow stores no token. A maintainer who can publish does this once:

1. Publish the first version from a terminal, since a trusted publisher can only be set for a package that exists (the terminal cannot produce provenance, so turn it off for this one command): `cd packages/design && npm login && npm publish --access public --provenance=false`.
2. On the package's settings page on npmjs.com, add a trusted publisher: GitHub Actions, organisation `kairos-io`, repository `design`, workflow file `release.yml`, and allow `npm publish` under Allowed actions. Do this when a release tag is ready to push, because a new trusted publisher must complete its first publish within two days.
3. After the first successful publish by the workflow, set the package's publishing access to require two-factor authentication and disallow tokens.

A run of the Release workflow started by hand is a dry run: it builds, checks and packs, and never publishes. The package stays `"private": true` until the maintainers remove the flag for the first publish ([kairos-io/kairos#5516](https://github.com/kairos-io/kairos/issues/5516)).

## Roadmap

- Radio cards, a skeleton loader, a Radix tooltip, the fleet gauge and sparkline from the Node Detail deck.
- Web Components over the same tokens, if a non-React Kairos surface needs behaviour and not only styles.

## Licence and trademarks

Apache-2.0, see [LICENSE](../../LICENSE). The Kairos name and logos are trademarks of The Linux Foundation; use follows the [Linux Foundation trademark policy](https://www.linuxfoundation.org/trademark-usage). The artwork is included unchanged from [cncf/artwork](https://github.com/cncf/artwork/tree/main/projects/kairos).
