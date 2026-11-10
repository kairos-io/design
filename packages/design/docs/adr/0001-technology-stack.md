# ADR 0001: Technology stack

Date: 2026-10-09. Status: accepted.

## Context

[kairos-io/kairos#5083](https://github.com/kairos-io/kairos/issues/5083) asks for a shared design system with centralised tokens, a reusable component library, framework compatibility where practical, distribution as a versioned package, and documentation for every component. Its first action item is to pick the stack.

The consumers are known. AuroraBoot's UI is React 19, Tailwind v4, Radix primitives and class-variance-authority, built with Vite. kairos-docs is Docusaurus 3 on React 19 with Infima. The Kairos web installer is three HTML pages and one stylesheet embedded in a Go binary, with no build step and no network. packages.kairos.io is Go templates on Bulma.

## Decision

- **Tokens as CSS custom properties, generated from one source.** A script writes `tokens.css` (plain custom properties, light and dark) and a Tailwind v4 `@theme inline` file from the token source (since ADR 0003, `tokens.json`, shared with the decks). Custom properties are the one format every consumer reads: the installer and Docusaurus with no tooling, Tailwind through the theme mapping, JavaScript through the `./tokens` entry.
- **React 19 components on Tailwind v4, Radix and CVA.** That is what AuroraBoot already is, so its components port without change and it adopts the package by deleting code. Docusaurus can host the same components. Nothing else in the Kairos web estate uses a different component framework.
- **A framework-free CSS layer.** `components.css` carries the installer's class names over the tokens, so a page with no build step is a first-class consumer rather than a copy.
- **Storybook 10 with the react-vite framework**, the docs, a11y and themes addons, published to GitHub Pages from `main`. Grafana's UI catalogue was the reference the issue discussion pointed at.
- **Build:** tsdown for the ESM bundle and types, the Tailwind CLI for `styles.css`, Vitest and Testing Library for tests, ESLint and Prettier. ESM only: every consumer is a bundler or a browser, and a CommonJS build would double the surface for nobody.
- **Distribution:** `@kairos-io/design` on npm, Apache-2.0, released from a tag with provenance.

## Alternatives

- **Web Components.** Framework-neutral, but none of the consumers is a non-React framework; the non-React consumers are CSS-only pages. Web Components would add a runtime to the installer, which must stay a few static files. They remain a possible later addition over the same tokens.
- **Vue or another framework.** No Kairos project uses one.
- **CSS only, no components.** Covers the installer and the docs but leaves AuroraBoot, the largest consumer, maintaining its own component tree, which is where drift starts.
- **Tailwind v3 or no Tailwind.** AuroraBoot is on v4; v4's `@theme inline` is what makes a token change a class on `<html>` rather than a rebuild.

## Consequences

- AuroraBoot can adopt in a day: identical token names, identical components.
- The installer and the docs adopt the tokens with one `@import` each and no new dependency.
- Two artefacts must stay in step, the React components and `components.css`. The conventions require a vanilla counterpart where the installer has one.
- Consumers that are not ESM need a dynamic import; none exist today.
