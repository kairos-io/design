# Kairos design system

Design direction **Tessellate** for the Kairos suite: kairos.io, the docs, Kairos Installer, the Kairos console (formerly AuroraBoot) and hadron-linux.io.

**Live:** https://kairos-io.github.io/design-system/ (published by `.github/workflows/pages.yml` on every push to `main`).

One-time setup: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Locally: `python3 -m http.server` in this folder, then open http://localhost:8000. Each screen has a light/dark theme prop.

## Contents
- `Kairos - Foundations.dc.html`: logos, color, type, tiles, components, naming, voice
- `kairos.io Homepage.dc.html`
- `Kairos Docs - Product Page.dc.html`: L1 / L2 / L3 maturity tracks
- `Kairos Installer.dc.html`: on-node UI at :8080
- `Kairos Console - Nodes / Node Detail / Build Artifact`: grounded in the AuroraBoot ui/src (now merged into kairos-io/kairos)
- `hadron-linux.io Homepage.dc.html`
- `assets/`: logos (unchanged)
- `explorations/`: competitive landscape and directions D–F

## Testing
`.github/workflows/render.yml` renders every screen in Chromium, Firefox and WebKit on Linux, macOS and Windows runners, at desktop and mobile (Pixel 7, iPhone 14) sizes, with web fonts both allowed and blocked. It fails on console errors, horizontal overflow or text under 12px, and uploads screenshots as artifacts. Runs free on GitHub-hosted runners. Locally: `npm install && npx playwright install --with-deps && npm test`. Android and iOS are device emulation (Chrome and WebKit engines at phone size); real devices need a paid farm, so spot-check those by hand.

## Key decisions
- Logos unchanged; palette from the logos. Kairos orange #EE5007 / #FF7442 / #FB9E70, Hadron blue #004CCE / #0275E7 / #1BAAFF.
- Light: violet-tinted mist (#F2F1F5). Dark: violet ink (#15141C), never navy, never brown. One cool neutral family across both themes.
- Ink text on orange; white on Hadron blue.
- Urbanist + Martian Mono (normal width), self-hosted in assets/fonts (no Google Fonts request; works offline on the Installer). Full system fallback stacks for Linux/macOS/Windows/Android. Text floor 12px. Radius 4px. No shadows.
- Independent of any vendor brand: no third-party design-system fonts, colors or components.

## Naming
- **Kairos**: the project, the suite and the `kairos` CLI. AuroraBoot is merged into the kairos repo and has no separate name.
- **The Kairos console**: the web UI, started with `kairos ui`. A lowercase description, not a product name. Sections: Factory, Deploy, Fleet.
- **Kairos Factory**: kairos-init (name stays)
- **Kairos Installer**, **Kairos Operator**, **Kairos Lab**
- **Hadron**: ships inside every Kairos release ("Hadron by Kairos")
- CLI: `kairos <command>`; separate tools keep their own binaries

Node names, metrics and some versions in the screens are illustrative.
