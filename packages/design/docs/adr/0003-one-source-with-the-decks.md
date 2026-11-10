# ADR 0003: One token source, shared with the design decks

Date: 2026-10-20. Status: accepted. Supersedes the "record the shipped design" decision of ADR 0002.

## Context

The maintainers decided on 2026-10-16 ([kairos-io/kairos#5083](https://github.com/kairos-io/kairos/issues/5083)) that the design system lives in `kairos-io/design`, the repository that holds the Tessellate decks, and that the package is `@kairos-io/design`. The first step, [#5511](https://github.com/kairos-io/kairos/issues/5511), landed as `packages/design`: a `tokens.json` with the deck values, a generator for `tokens.css` and `tailwind.css`, and a check that fails when a deck and the file disagree.

This package began in a separate repository and recorded what the Kairos web projects shipped at the time (ADR 0002): AuroraBoot's semantic names, Noto Sans, navy chrome, a 10px radius, shadows. ADR 0002 already said that a design direction would land as values, not as component changes, and that the package would carry whichever direction the maintainers chose. They chose Tessellate, and the migration of the package into this repository is where the two meet.

## Decision

- **`tokens.json` is the only token source.** The package's former TypeScript source is gone; `src/tokens/index.ts` is a typed view of the JSON. The generator and the deck check are the upstream ones, extended with the few values the components need and the decks ground: the warning amber and the ink on a status fill, the terminal inks, the dialog scrim, the 2 / 4 / 8 radius steps the Foundations deck names, and the motion tokens.
- **Components use the deck vocabulary.** `bg`, `surface`, `raised`, `line`, `ink`, `sub`, `muted`, `accent`, `on-accent`, `link`, `code` and the rest, as Tailwind utilities (`bg-surface`, `text-sub`) and as custom properties. AuroraBoot's names (`background`, `card`, `muted-foreground`, `primary`) are not aliased: one vocabulary, the one the designers use, so a deck and a component can be read against each other.
- **The design is Tessellate.** Urbanist and Martian Mono, self-hosted; one violet neutral family in both themes; one 4px radius; no shadows, elevation as a tone step; dark ink on Kairos orange, white on Hadron blue. The AuroraBoot-era values are retired rather than kept as a second theme, because the console is being redesigned to the decks ([#5514](https://github.com/kairos-io/kairos/issues/5514)) and a theme nobody will ship is maintenance without a reader.
- **Hadron is a variant, not a theme.** `data-variant="hadron"` swaps the accent, the ink on it and the links, in either theme, as `tokens.json` records it. Everything else stays.
- **The theme is an attribute.** `data-theme="light|dark"` on `<html>`, or on any element, as the decks and `tokens.css` already do. The `light` and `dark` classes are gone.
- **The Pages site serves the Storybook and the package.** The decks stay at the root of the site, the Storybook builds into `/storybook/`, and the packed tarball sits under `/packages/design/` so a branch or a fork can be installed with `npm install <url>` before the registry has it.

## Consequences

- A value changes in one place and shows up in the decks' check, the generated CSS, the Storybook swatches and every component.
- The console's adoption is a rename of utilities, listed on the Adoption page, instead of a drop-in. That cost is paid once; the alternative was two vocabularies forever.
- The installer's `components.css` keeps the installer's class names but takes the Tessellate look, which is what the Kairos Installer deck shows.
- Anything in the package that is not in a deck is a proposal to the designers, and the pull request says so.
