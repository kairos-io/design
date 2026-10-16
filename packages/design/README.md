# @kairos-io/design

The Kairos design tokens as CSS custom properties and as a Tailwind 4 theme. The values come from the decks in this repository (kairos-io/design). Version 0.1.0.

Publishing to npm is a later step for the maintainers. `package.json` has `"private": true` so that `npm publish` cannot run by accident; the maintainers remove it when they publish. Until then, use the files from a checkout of this repository.

The examples below use the package name, which works once the package is installed from npm. From a checkout of this repository, use the relative path instead, for example `@import "./packages/design/tokens.css";` from the repository root (the root has no npm workspaces, so the package name does not resolve there).

## Use the CSS variables

```css
@import "@kairos-io/design/tokens.css";

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
}
a { color: var(--link); }
```

Light is the default. To pick a theme, set `data-theme="light"` or `data-theme="dark"` on `<html>` (or on any element, to theme a part of the page). When `data-theme` is not set, the system setting decides.

The colors that differ between a few screens are variants. Set `data-variant="console"`, `"site"`, `"hadron"`, `"installer"` or `"foundations"` on an element to get them. Most projects need only `hadron`, for the Hadron blue accent with white text on it (`--onAccent`) and the Hadron link colors. `hadron` does not change `--accentLine`, `--accentSoft` or `--codeKey`: they stay Kairos orange, because no deck defines Hadron values for them. Put `data-variant` on the element that carries `data-theme`, or below it. One limit: a `data-theme="light"` section nested inside a dark section applies the dark variant values to a `data-variant` element that sits below that light section; put `data-variant` on the light section itself in that case. The `description` of each variant in `tokens.json` says which decks use it.

The variable names are the ones the decks already use (`--ink`, `--sub`, `--line`, `--surface`, `--link`, `--ok`). They have no prefix, so check for a clash before you add the file to a page that has its own `--bg` or `--line`.

## Use the Tailwind 4 theme

```css
@import "tailwindcss";
@import "@kairos-io/design/tailwind.css";
```

`tailwind.css` imports `tokens.css` for you. Then:

```html
<div class="bg-bg text-ink border border-line rounded-base p-6">
  <h1 class="text-h1 font-sans">Run it immutable</h1>
  <button class="bg-accent text-on-accent rounded-base px-4 py-2">Install</button>
</div>
```

- Theme colors (`bg`, `surface`, `ink`, `sub`, `muted`, `line`, `accent`, `link`, `ok`, ...) follow light and dark by themselves.
- Brand colors do not change with the theme: `kairos-light`, `kairos-mid`, `kairos-orange`, `hadron-sky`, `hadron-blue`, `hadron-deep`, `status-healthy`, `status-recovery`.
- The type scale is `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-label`, `text-mono`. Each sets size, weight and letter spacing.
- The spacing scale 4, 8, 12, 16, 24, 32, 48 and 80 px is `1`, `2`, `3`, `4`, `6`, `8`, `12` and `20` (Tailwind's step is set to 4px).
- There is one radius, `rounded-base` (4px). The shadow utilities are removed, because the design has no shadows.
- Contrast on Hadron: white on `hadron-blue` `#0275E7` is 4.47:1, just under the WCAG AA 4.5:1 for normal-size text (the Foundations deck says 4.6:1). `bg-accent text-on-accent` under the `hadron` variant is therefore fine for large or bold text but not for small buttons; use `bg-hadron-deep text-white` (`#004CCE`, 7.18:1) there. Ink on Kairos orange is 4.70:1.
- The default Tailwind colors are still there. Add `--color-*: initial;` in your own `@theme` if you want only the Kairos colors.

## Tokens

All values are in `tokens.json`. The generated files are `tokens.css` and `tailwind.css`.

| Group | Tokens |
|---|---|
| Brand colors | kairos-light `#FB9E70`, kairos-mid `#FF7442`, kairos-orange `#EE5007`, hadron-sky `#1BAAFF`, hadron-blue `#0275E7`, hadron-deep `#004CCE` |
| Status colors | healthy `#2F8F57`, recovery `#C62B2B` |
| Theme colors | `bg` `side` `surface` `inner` `head` `hover` `raised` `line` `ink` `sub` `muted` `accent` `accentSoft` `accentLine` `onAccent` `link` `ok` `warnBg` `deep` `code` `codeBar` `codeKey`, each with a light and a dark value |
| Fonts | `--font-sans` (Urbanist), `--font-mono` (Martian Mono), weights 400, 600, 700 |
| Type scale | display 84, h1 56, h2 40, h3 24, body-lg 19, body 16, label 14, mono 13 px; text is never smaller than 12px |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 80 px as `--space-4` ... `--space-80` |
| Radius | `--radius-base` 4px |
| Layout | `--page-max` 1280px |
| Shadow | none |

The package does not load the fonts. The files are in `assets/fonts` of this repository (`assets/fonts/fonts.css`).

Colors that the decks use but that are not a clear token yet are listed in `untokenised` in `tokens.json`. They are not written to the CSS.

## Change a token

1. Edit `tokens.json`.
2. Run `npm run build` in the repository root. It rewrites `tokens.css` and `tailwind.css`.
3. Run `npm run check:tokens`.
4. Commit the three files together.

If a deck changes a color, the check fails until `tokens.json` has the same value. The check also fails when a deck uses a hex color or a `var(--name)` that `tokens.json` does not know, and when the generated files are not what the build would write now. It runs in CI (`.github/workflows/tokens.yml`). It needs only Node, no install.
