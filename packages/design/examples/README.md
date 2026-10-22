# Examples

Small, complete consumers of `@kairos-io/design`, one per way of using it.
CI packs the real tarball and builds `react-vite` against it, so these are
the proof that the package installs and renders outside this repository.

| Example       | Shows                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------- |
| `react-vite/` | A React app with no Tailwind of its own: components plus `styles.css`.                      |
| `plain-html/` | A page with no build step: `tokens.css` and `components.css`, light and dark.               |
| `go-embed/`   | A Go binary that embeds the two CSS files and serves a page, the web installer's situation. |

Run the React example locally after `npm run build` at the repository root:

```
cd examples/react-vite
npm install
npm run dev
```
