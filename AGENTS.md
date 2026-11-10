# Notes for agents (and people in a hurry)

This repository holds the Kairos decks (the `*.dc.html` files at the root) and `@kairos-io/design`, the npm package in `packages/design/` (tokens, React components, styles, Storybook). Read `packages/design/README.md` and `packages/design/CONTRIBUTING.md` first; this file only collects what is easy to get wrong.

## Working here

- Commits are signed off (`git commit -s`): the DCO check blocks a pull request without it. Commit messages are conventional (`feat:`, `fix:`, `docs:`, `chore:`).
- Run from `packages/design` before a pull request: `npm ci`, `npm run check:tokens`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. `tokens.json` is the source of the token files; never edit `tokens.css`, `tailwind.css` or `src/tokens/resolved.json` by hand, run the build.
- Renovate and Dependabot open dependency pull requests. A Renovate change to `package.json` without the lockfile fails `npm ci`; refresh the lockfile or let Renovate rebase, do not merge it red.
- Do not force-push to `main` or to someone else's branch.

## Releases

The full procedure is the "Releasing" section of `packages/design/README.md`. In short: a pull request bumps `version` and `CHANGELOG.md`, it is merged, then a maintainer pushes an annotated `vX.Y.Z` tag and `release.yml` publishes to npm with provenance and makes the GitHub release.

- Never run `npm publish` from a terminal and never add an npm token to the repository. The only publisher is `release.yml`, through npm trusted publishing.
- Do not create or push a `v*` tag unless a maintainer asked for that release in this conversation. A tag publishes to a public registry and cannot be undone; a version cannot be reused.
- The version in `packages/design/package.json` must be one npm does not have yet (`npm view @kairos-io/design versions`); the workflow fails early otherwise.
- The npm-side setup (trusted publisher, two-factor-only publishing access) is done in the npm web UI by a maintainer. An agent cannot do it; say what is needed and stop.
- Pages (`pages.yml`) deploys only a push run of this repository. Keep that condition: without it a fork's pull request could deploy its own code.
