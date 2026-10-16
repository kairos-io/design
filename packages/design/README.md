# @kairos-io/design

The Kairos design tokens as CSS custom properties and as a Tailwind 4 theme. The values come from the decks in this repository (kairos-io/design). Version 0.1.0.

## Install

```sh
npm install @kairos-io/design
```

Once the first release is published, the package is on the public npm registry under the `@kairos-io` organisation. It has no dependencies and no JavaScript to run: it ships `tokens.css`, `tailwind.css` and `tokens.json`.

The examples below use the package name, which works once the package is installed. From a checkout of this repository, use the relative path instead, for example `@import "./packages/design/tokens.css";` from the repository root (the root has no npm workspaces, so the package name does not resolve there).

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
- Contrast on Hadron: white on `hadron-blue` `#0275E7` is 4.47:1, just under the WCAG AA 4.5:1 for normal-size text (the Foundations deck says 4.6:1). `bg-accent text-on-accent` under the `hadron` variant is therefore fine for large or bold text but not for small buttons; use `bg-hadron-deep text-white` (`#004CCE`, 7.18:1) there. Ink on Kairos orange is 4.70:1 (the Foundations deck says 5.3:1).
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

## Use it without a build step

A page that has no bundler (the web installer, for example) cannot resolve `@import "@kairos-io/design/tokens.css"`. Copy the file from a release instead:

```sh
npm pack @kairos-io/design@0.1.0
tar -xzf kairos-io-design-0.1.0.tgz package/tokens.css
cp package/tokens.css path/to/your/project/tokens.css
```

Replace `0.1.0` with the version you want, and commit the copied file with a note of that version. To update, repeat with the new version. The same file is in `node_modules/@kairos-io/design/tokens.css` after `npm install @kairos-io/design`.

## Versions

The package follows semantic versioning. This mapping is a proposal for the maintainers to confirm:

- A token value changes (a color, a size, a spacing step): minor version.
- A token is renamed or removed, or a `data-theme` or `data-variant` rule changes meaning: major version. Before 1.0.0, a breaking change may go in a minor version, but the release notes must say so.
- A new token: minor version.
- A README change, or a generator-only change that leaves the generated files the same: patch version.

## Who may publish

Organisation owners and admins, and members of a team that has read-write access to the package, can publish. Owners manage the members and teams on the organisation's page on npmjs.com. Through the workflow, anyone who can push a `v*` tag to this repository can start a release, so see the hardening below.

## Make a release

1. Open a pull request that sets `version` in `packages/design/package.json` (and changes the tokens, if the release has token changes). Run `npm run build` and `npm run check:tokens` first. Merge it.
2. Tag the merge commit with the same version, with a `v` in front, and push the tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. The workflow `.github/workflows/release.yml` runs on the tag. It runs the build and the token check, fails if the tag does not match the `version` in `package.json`, and publishes with npm provenance.

The workflow uses npm trusted publishing (OIDC). It stores no npm token. This works only after the one-time setup below.

A run started by hand from the Actions tab is a dry run. It builds, checks and packs, and never publishes.

### One-time setup (first release)

A person who can publish does this. Steps 1 and 2 happen once. Step 3 happens when a release tag is ready.

1. On a clean, up-to-date `main`, run `npm run build` and `npm run check:tokens` in the repository root. Both must pass and leave no change.
2. Publish the first version from a terminal. A trusted publisher can be set only for a package that already exists. `publishConfig` asks for provenance, which a terminal cannot give, so turn it off for this one command. npm asks for your two-factor confirmation (a browser prompt or a code):
   ```sh
   cd packages/design
   npm login
   npm publish --access public --provenance=false
   ```
3. When the next release is ready (its version is merged, and you can push its `v*` tag now), add the trusted publisher on the package's settings page on npmjs.com: GitHub Actions, organisation `kairos-io`, repository `design`, workflow file `release.yml`. Then push the tag at once. The npm documentation (https://docs.npmjs.com/trusted-publishers) says: "A newly created trusted publisher configuration must complete its first successful publish within 2 days." and "If the configuration is not validated within 2 days, it expires and can no longer be used or edited." If it expired, delete it on the settings page and create it again.
4. After the first successful publish by the workflow, set the package's publishing access to "Require two-factor authentication and disallow tokens" on the same settings page.
5. From then on, release by tag as described above.

### Recommended hardening (optional)

Anyone with write access to the repository can push a `v*` tag on any commit, and the tag starts a release. Two optional steps reduce that. The GitHub menu paths below were written without clicking through them, so the menu names may differ.

- Restrict who can create `v*` tags. On GitHub: repository Settings, Rules, Rulesets, New ruleset, New tag ruleset. Target the tag pattern `v*` and restrict creations.
- Require a reviewer before each publish. On GitHub: repository Settings, Environments, New environment (for example `npm`), then Required reviewers. If you add an environment, add `environment: npm` (the same name) to the `publish` job in `release.yml`, and enter the same name in the "Environment" field of the trusted publisher on npm. The names must match, or the publish fails. The npm documentation says the fields of a trusted publisher are fixed once it is created, so adding an environment later means deleting the trusted publisher and creating it again (and the 2-day window above starts again).
