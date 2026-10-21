# Kairos design system

Design direction **Tessellate** for the Kairos suite: kairos.io, the docs, Kairos Installer, the Kairos console (formerly AuroraBoot) and hadron-linux.io.

**Live:** https://kairos-io.github.io/design/ (published by `.github/workflows/pages.yml` on every push to `main`). The Storybook of the design package is at https://kairos-io.github.io/design/storybook/, and the packed package at https://kairos-io.github.io/design/packages/design/kairos-io-design.tgz.

One-time setup: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**. To publish a branch, allow it on the `github-pages` environment (Settings → Environments) and run the workflow on that branch.

Locally: `python3 -m http.server` in this folder, then open http://localhost:8000. Each screen has a light/dark theme prop.

## Contents
- `Kairos - Foundations.dc.html`: logos, color, type, tiles, components, voice
- `kairos.io Homepage.dc.html`
- `Kairos Docs - Product Page.dc.html`: L1 / L2 / L3 maturity tracks
- `Kairos Installer.dc.html`: on-node UI at :8080
- `Kairos Console - Nodes / Node Detail / Build Artifact`: grounded in the AuroraBoot UI, which lives today in `ui/` of kairos-io/AuroraBoot and is planned to move
- `hadron-linux.io Homepage.dc.html`
- `Kairos - Naming.dc.html`: what stays a product, what became functionality, and what changed (AuroraBoot → the Kairos console)
- `Kairos - Talk Deck.dc.html`: conference slide template (1920×1080, light mode)
- `Kairos - Presentations.dc.html`: how to present, download (`npm run pdf`) and build a talk from the deck
- `packages/design/`: `@kairos-io/design`, the design system as code: the tokens (`tokens.json`, the one source the decks and the package share, generated into CSS custom properties and a Tailwind 4 theme), the React components, the framework-free `components.css`, and the Storybook that documents all of it with the screens above as live pages (see its README). `npm run build` regenerates the tokens, `npm run check:tokens` fails when the decks and the package differ, `npm run storybook` runs the Storybook
- `assets/`: logos (unchanged)
- `explorations/`: competitive landscape and directions D–F

## Testing
`.github/workflows/ci.yml` lints, tests, builds and packs the design package, then installs the packed tarball in its React example. `.github/workflows/tokens.yml` checks the decks against `packages/design/tokens.json`. `.github/workflows/release.yml` publishes the package to npm on a `vX.Y.Z` tag and attaches the tarball to a GitHub release (see the package README for the one-time npm setup).

`.github/workflows/render.yml` renders every screen in Chromium, Firefox and WebKit on Linux, macOS and Windows runners, at desktop and mobile (Pixel 7, iPhone 14) sizes, with web fonts both allowed and blocked. It fails on console errors, horizontal overflow or text under 12px, and uploads screenshots as artifacts. Runs free on GitHub-hosted runners. Locally: `npm install && npx playwright install --with-deps && npm test`. Android and iOS are device emulation (Chrome and WebKit engines at phone size); real devices need a paid farm, so spot-check those by hand.

## Key decisions
- Logos unchanged; palette from the logos. Kairos orange #EE5007 / #FF7442 / #FB9E70, Hadron blue #004CCE / #0275E7 / #1BAAFF.
- Light: violet-tinted mist (#F2F1F5). Dark: violet ink (#15141C), never navy, never brown. One cool neutral family across both themes.
- Ink text on orange; white on Hadron blue.
- Urbanist + Martian Mono (normal width), self-hosted in assets/fonts (no Google Fonts request; works offline on the Installer). Full system fallback stacks for Linux/macOS/Windows/Android. Text floor 12px. Radius 4px. No shadows.
- Independent of any vendor brand: no third-party design-system fonts, colors or components.

## Naming
One source of truth: `Kairos - Naming.dc.html` (products vs functionality, before → after, Hadron, base distros, docs levels, CLI, writing rules).

Node names, metrics and some versions in the screens are illustrative.
