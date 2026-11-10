# ADR 0004: The decks read the tokens, and the tokens are in the W3C format

Date: 2026-10-20. Status: accepted. Builds on ADR 0003.

## Context

After ADR 0003 the package and the decks shared one file, `tokens.json`, but not one source: every deck still carried its colours inline (a light and a dark map of custom properties in its script, hex fallbacks in every `var()`, literal hex in the markup and the JavaScript), and `check.cjs` verified that those copies agreed with the file. The check had a hand-kept list of which variant each deck may use and an `untokenised` escape hatch. The file itself was a bespoke shape with camelCase names (`accentSoft`) that became kebab-case in Tailwind (`accent-soft`).

## Decision

- **The decks read `tokens.css`.** Each deck links `packages/design/tokens.css` in its helmet, paints with `var(--token)` and nothing else, and switches theme with `data-theme` on its root (the deck's `theme` prop sets it) instead of a theme map. A deck that needs a variant sets `data-variant` on its root; the Hadron homepage nests `data-variant="hadron"` inside `data-variant="site"`, because the selector matches the attribute value exactly. `check.cjs` now fails a deck that does not link the file, that carries a theme map, that names a variable `tokens.css` does not define, or that sets a variant it is not listed for; the hex rule stays for the handful of literals under `untokenised`.
- **`tokens.json` is in the W3C Design Tokens (DTCG) format.** A token is `{ "$value", "$type" }`, groups carry a `$type` their tokens inherit, and a `{path.to.token}` value is an alias, so `themes.light.accent` is visibly `{color.brand.kairos-orange}` and the Hadron variant's `on-accent` is `{color.base.white}`. The generator resolves the aliases into a plain view, writes `tokens.css`, `tailwind.css` and `src/tokens/resolved.json` (the typed view the package and the Storybook read), and the generated CSS is the same as before the change except for the names below and one new `--white`. Style Dictionary, Terrazzo and Tokens Studio read the format; the generator stays a dependency-free Node script because the deck check must run with nothing installed.
- **One naming rule.** The custom properties are kebab-case everywhere: `--accent-soft`, `--accent-line`, `--on-accent`, `--warn-bg`, `--code-bar`, `--code-key`, `--code-ink`, `--code-muted`. The Tailwind names did not change.

## Consequences

- A colour exists once. Changing `tokens.json` and running `npm run build` changes the decks, the Storybook, the components and the published CSS together; nothing is copied.
- The deck tool writes inline styles when it regenerates a deck. A regenerated deck must keep the `var()` references and the `data-theme` root, or the check fails and says which colour reappeared.
- The remaining literals in the decks are exactly the `untokenised` list: the talk deck's darker orange gradient, the installer's editor greys, a tint and a hairline. Each is a decision for the designers, not a drift.
- The rename is a breaking change for anyone who used `--accentSoft` and friends from the unpublished 0.1.0 package.
