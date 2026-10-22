# Contributing

Thanks for helping keep Kairos looking like one project. Issues go to [kairos-io/kairos](https://github.com/kairos-io/kairos/issues), like every Kairos repository; pull requests come here, to [kairos-io/design](https://github.com/kairos-io/design).

## Setup

```sh
git clone https://github.com/kairos-io/design.git
cd design/packages/design
npm ci
npm run storybook
```

Node 22 (`.nvmrc` at the repository root). `npm run check:tokens`, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run build` and `npm run build-storybook` are what CI runs (`.github/workflows/ci.yml`).

## The one rule

The decks in this repository are the design. A value or a component in the package comes from a deck (Foundations, a screen, the talk deck), or the pull request says why it is new and the designers see it. Read [docs/CONVENTIONS.md](docs/CONVENTIONS.md) before writing a component.

## Adding or changing a token

1. Edit `tokens.json` (W3C Design Tokens format: `$value`, `$type`, `{aliases}`). A theme colour needs a value under `themes.light` and `themes.dark`; a variant lists only the names it changes.
2. `npm run build` in this directory (or `npm run build` at the repository root) regenerates `tokens.css`, `tailwind.css` and `src/tokens/resolved.json`. Commit them with `tokens.json`; CI checks they match and that every deck reads them.
3. `npm test`. The token tests check both themes, the OS-preference block, the variants and the tone mapping; the contrast tests check the pairs the components put together.
4. If the token is a colour, look at the Foundations/Color page: the contrast table is computed from the values.

The decks link `tokens.css` and paint with `var(--token)`. If a deck needs a colour that `tokens.json` does not have, `npm run check:tokens` fails until it does. Add it as a token, or under `$extensions.io.kairos.design.untokenised` with a note, in the same pull request as the deck.

## Adding a component

1. `src/components/<Name>/` with `<Name>.tsx`, `<Name>.stories.tsx`, `<Name>.test.tsx` and `index.ts`. Copy the layout of `Button`.
2. Export it from `src/index.ts`, in alphabetical order.
3. Stories: `Default`, then one per variant group, then states, then a composed example, with realistic Kairos content. Check both themes in the toolbar and the a11y panel, and the Hadron variant if the component shows the accent.
4. If the component has a vanilla counterpart in the installer, add the classes to `src/styles/components.css` under the installer's names.
5. A line under Unreleased in `CHANGELOG.md`.

## Adding a page

A screen from a deck becomes a story under `src/pages/`, title `Pages/<Product>/<Screen>`, built from the components and nothing else. It is the proof that the components can make the deck; where they cannot, the component changes, not the page.

## Pull requests

- One concern per PR; squash before merge.
- Sign off every commit (`git commit -s`): the Kairos projects require the Developer Certificate of Origin.
- Mention the kairos-io/kairos issue in the commit message, e.g. `:seedling: Add Chip (part of #5512)`.
- CI must be green. The `consume` job installs the packed tarball into `examples/react-vite` and builds it, so a change to the export map shows up there.

## Releasing

Maintainers: bump `version` in `package.json`, move the Unreleased section in `CHANGELOG.md` under the new version with the date, tag `vX.Y.Z`, push the tag. The Release workflow publishes to npm with trusted publishing and creates the GitHub release with the tarball attached. The README of this package says what has to be set up on npm once.
