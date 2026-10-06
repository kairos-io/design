# Kairos design system

Design direction **Tessellate** for the Kairos suite: kairos.io, the docs, Kairos Installer, Kairos Platform (formerly AuroraBoot) and hadron-linux.io.

**Live:** https://kairos-io.github.io/design-system/ (published by `.github/workflows/pages.yml` on every push to `main`).

One-time setup: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Locally: `python3 -m http.server` in this folder, then open http://localhost:8000. Each screen has a light/dark theme prop.

## Contents
- `Kairos - Foundations.dc.html`: logos, color, type, tiles, components, naming, voice
- `kairos.io Homepage.dc.html`
- `Kairos Docs - Product Page.dc.html`: L1 / L2 / L3 maturity tracks
- `Kairos Installer.dc.html`: on-node UI at :8080
- `Kairos Platform - Nodes / Node Detail / Build Artifact`: grounded in kairos-io/AuroraBoot ui/src
- `hadron-linux.io Homepage.dc.html`
- `assets/`: logos (unchanged)
- `explorations/`: competitive landscape and directions D–F

## Key decisions
- Logos unchanged; palette from the logos. Kairos orange #EE5007 / #FF7442 / #FB9E70, Hadron blue #004CCE / #0275E7 / #1BAAFF.
- Light: warm stone (#F1EEE8). Dark: violet ink (#15141C), never navy, never brown.
- Ink text on orange; white on Hadron blue.
- Urbanist + Martian Mono (narrow). Radius 4px. No shadows.

## Naming (proposal, pending team decision)
- **Kairos**: the project and suite
- **Kairos Platform**: the console you run, formerly AuroraBoot. Ships as `kairos-platform`. Sections: Factory (artifacts, extensions), Deploy, Fleet (nodes, groups)
- **Kairos Factory**: kairos-init (name stays)
- **Kairos Installer**, **Kairos Operator**, **Kairos Lab**
- **Hadron**: ships inside every Kairos release ("Hadron by Kairos")
- CLI: git-style, one binary per project, optional `kairos <tool>` dispatch

Node names, metrics and some versions in the screens are illustrative.
