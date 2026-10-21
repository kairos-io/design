# ADR 0002: Record the shipped design; do not redesign

Date: 2026-10-09. Status: accepted.

## Context

The Kairos web projects already agree on most of a visual language. AuroraBoot's `ui/src/index.css` defines semantic tokens (orange primary `#EE5007`, navy `#03153A` chrome, a slate neutral set, a 10px radius, a dark theme) and enforces them with tests. The web installer's `style.css` copies those tokens by hand and says so in its first comment. kairos-docs uses the same oranges and navy under `--kairos-*` names and the same font, Noto Sans. The CNCF artwork fixes the three oranges.

A separate repository, `kairos-io/design-system` (private, October 2026), holds static mockups of a different direction, called Tessellate: Urbanist and Martian Mono, violet-tinted neutrals, no navy, no shadows, a 4px radius. It is a design exploration, not code, and no project ships it.

## Decision

Version 0.1.0 of this package records what ships. Every token value and every component variant traces to AuroraBoot, the installer, the docs or the artwork; the changelog lists the two deliberate exceptions (toast tones, theme class handling). The first release's job is to give the projects one source for what they already do, so that adoption is a deletion and not a redesign review.

Tessellate, or any other direction, is a second theme. The architecture is built for that: components know only token names, a theme is a block of values under a selector, and the `noHardcodedColors` test guarantees nothing in a component can bypass it. Fonts and radius are tokens too. A direction becomes real here by adding its values, not by changing components.

## Consequences

- Adoption carries no visual change, so it can proceed project by project without a design decision in each.
- A design direction has a concrete landing place and a concrete test: add the theme, flip the class in Storybook, read every page.
- The package does not settle which direction Kairos should take. That is a maintainers' decision in the main repository, and this package will carry whichever is made.

## Update, 2026-10-10

The tile pattern from Tessellate (a hexagon split into three rhombi in the logo's oranges, tiled into fields that fade to outlines, plus the tile bar and the numbered marker) was brought into the package as `src/lib/tiles.ts`, the `Tiles` components and the `assets/patterns/` files. It is additive brand geometry: it paints with the existing `--brand-*` tokens, changes no component and no value, and is documented under Foundations/Tiles with the rules the direction set for it. That is the intended path for anything else from that direction: a piece that fits the shipped tokens comes across as it is; a piece that needs different values comes across as a second theme.
