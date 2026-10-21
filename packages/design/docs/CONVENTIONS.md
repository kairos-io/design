# Component conventions

How a component in `src/components/` is written, so that everything in the
system reads as one piece of work. These rules are checked by lint, the
tests and review.

## Where the design comes from

The system codifies what the Kairos web projects already ship. When a
component exists in AuroraBoot's `ui/src` (components/ui, components/fleet,
components/wizard), port it as it is: same variants, same class strings, same
behaviour. The web installer's `style.css` and `kairos-docs`' `custom.css`
cover the rest. Do not redesign; record. A deliberate change is a changelog
entry with a reason.

## Files

```
src/components/<Name>/
  <Name>.tsx          the component (one file may export a family: Card, CardHeader, ...)
  <Name>.stories.tsx  Storybook stories, title "Components/<Name>"
  <Name>.test.tsx     Vitest + Testing Library
  index.ts            re-exports, with types
```

`src/index.ts` re-exports every `index.ts`. Keep the export list sorted by
component name.

## Code

- TypeScript, strict. Named exports. `React.forwardRef` on anything that
  renders a DOM element a parent may need to reach.
- Relative imports with explicit extensions: `../../lib/cn.ts`.
- Class names: Tailwind utilities over the theme (`bg-accent`,
  `text-muted`, `border-line`, `bg-status-healthy/15`). Never a hex
  literal, never a Tailwind palette colour such as `bg-green-600`; the test
  `src/test/noHardcodedColors.test.ts` fails the build on both.
- Variants through `class-variance-authority`; merge classes with `cn()`.
- Tones (`success | warning | danger | info | neutral`) come from
  `src/lib/tone.ts`, and tone-to-class maps are written out in full so
  Tailwind finds every class.
- No router, no data fetching, no app state. Links take `href`, or `asChild`
  so the host passes its own `<Link>`.
- Radix primitives for anything with focus management or ARIA state
  (dialog, select, tabs). Everything else is plain DOM.
- Icon-only controls need an `aria-label`. Decorative icons get
  `aria-hidden="true"`.
- Comments explain why, in full sentences, and only where the code cannot
  say it.

## Stories

- `tags: ["autodocs"]`, a one-paragraph `docs.description.component` that
  says when to use the component and when not to.
- A `Default` story with controls, then one story per variant group, then
  the states (loading, disabled, empty, error) and a composed example.
- Stories must pass the a11y addon in both themes. Use realistic Kairos
  content (node names, image references, step names) rather than lorem ipsum.

## Tests

- Render, roles and names; keyboard behaviour where the component has any;
  the one or two classes that prove a variant applied. Not snapshots.
- Anything that writes to `localStorage` or `matchMedia` must survive both
  being absent.

## Vanilla CSS

`src/styles/components.css` is the framework-free layer for pages with no
build step (the web installer, packages.kairos.io). Its class names are the
installer's (`.btn`, `.card`, `.badge`, `.tone-success`, ...), and it only
uses `tokens.css` custom properties.

## Tiles

The tile geometry is hard-edged: mitre joins, square caps, no rounded-base
corners anywhere on a rhombus. Filled faces and grid outlines share the
exact same points so they coincide at every zoom. Motion never leaves a
blank cell: the grid is always complete underneath, and an animated cube
must land exactly on its outline.
