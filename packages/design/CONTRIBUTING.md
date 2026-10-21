# Contributing

Thanks for helping keep Kairos looking like one project. Issues go to [kairos-io/kairos](https://github.com/kairos-io/kairos/issues), like every Kairos repository; pull requests come here.

## Setup

```sh
git clone https://github.com/wcrum/kairos-design-system.git
cd design
npm ci
npm run storybook
```

Node 22 (`.nvmrc`). `npm test`, `npm run lint`, `npm run typecheck` and `npm run build` are what CI runs.

## The one rule

This package records the design the Kairos projects ship. A value or a component comes from AuroraBoot, the web installer, kairos-docs or the CNCF artwork, or the pull request says why it is new. Read [docs/CONVENTIONS.md](docs/CONVENTIONS.md) before writing a component.

## Adding or changing a token

1. Edit `src/tokens/index.ts`. A semantic colour needs a value for light and for dark.
2. `npm run build:tokens` regenerates `src/styles/tokens.css` and `theme.css`. Commit them; CI checks they match.
3. `npm test`. The token tests check both themes and the OS-preference block.
4. If the token is a colour, look at the Foundations/Color page: the contrast table is computed from the values.

## Adding a component

1. `src/components/<Name>/` with `<Name>.tsx`, `<Name>.stories.tsx`, `<Name>.test.tsx` and `index.ts`. Copy the layout of `Button`.
2. Export it from `src/index.ts`, in alphabetical order.
3. Stories: `Default`, then one per variant group, then states, then a composed example, with realistic Kairos content. Check both themes in the toolbar and the a11y panel.
4. If the component has a vanilla counterpart in the installer, add the classes to `src/styles/components.css` under the installer's names.
5. A line under Unreleased in `CHANGELOG.md`.

## Pull requests

- One concern per PR; squash before merge.
- Sign off every commit (`git commit -s`): the Kairos projects require the Developer Certificate of Origin.
- Mention the kairos-io/kairos issue in the commit message, e.g. `:seedling: Add Chip (part of #5083)`.
- CI must be green. The `consume` job installs the packed tarball into `examples/react-vite` and builds it, so a change to the export map shows up there.

## Releasing

Maintainers: bump `package.json`, move the Unreleased section in `CHANGELOG.md` under the new version with the date, tag `vX.Y.Z`, push the tag. The Release workflow publishes to npm and creates the GitHub release.
