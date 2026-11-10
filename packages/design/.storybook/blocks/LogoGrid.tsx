import { HadronLogo, HadronMark, KairosLogo, KairosMark } from "../../src/components/Logo/Logo.tsx";

// Each rendition on the surface it is meant for. The files ship in
// dist/assets/logos and are served here from src/assets by Storybook's
// staticDirs; the components inline the same shapes.

type Row = { label: string; files: string[]; dark?: boolean; flat?: boolean; render: () => React.ReactNode };

const kairosRows: Row[] = [
  {
    label: "Colour, on light surfaces",
    files: ["kairos-icon-color.svg", "kairos-horizontal-color.svg", "kairos-stacked-color.svg"],
    render: () => (
      <>
        <KairosMark height={64} label="Kairos mark, colour" />
        <KairosLogo height={64} label="Kairos horizontal logo, colour" />
        <KairosLogo layout="stacked" height={96} label="Kairos stacked logo, colour" />
      </>
    ),
  },
  {
    label: "Dark surfaces: the colour mark, the wordmark in white",
    files: ["kairos-icon-color.svg", "kairos-horizontal-dark.svg"],
    dark: true,
    render: () => (
      <>
        <KairosMark height={64} label="Kairos mark on a dark surface" />
        <KairosLogo variant="dark" height={64} label="Kairos horizontal logo, dark surface" />
      </>
    ),
  },
  {
    label: "White, on a flat fill or photography",
    files: ["kairos-icon-white.svg", "kairos-horizontal-white.svg", "kairos-stacked-white.svg"],
    flat: true,
    render: () => (
      <>
        <KairosMark variant="white" height={64} label="Kairos mark, white" />
        <KairosLogo variant="white" height={64} label="Kairos horizontal logo, white" />
        <KairosLogo variant="white" layout="stacked" height={96} label="Kairos stacked logo, white" />
      </>
    ),
  },
  {
    label: "Black, for one-colour print",
    files: ["kairos-icon-black.svg", "kairos-horizontal-black.svg", "kairos-stacked-black.svg"],
    render: () => (
      <>
        <KairosMark variant="black" height={64} label="Kairos mark, black" />
        <KairosLogo variant="black" height={64} label="Kairos horizontal logo, black" />
        <KairosLogo variant="black" layout="stacked" height={96} label="Kairos stacked logo, black" />
      </>
    ),
  },
];

const hadronRows: Row[] = [
  {
    label: "Colour, on light surfaces",
    files: ["hadron-icon-color.svg", "hadron-horizontal-color.svg"],
    render: () => (
      <>
        <HadronMark height={64} label="Hadron mark, colour" />
        <HadronLogo height={64} label="Hadron horizontal logo, light surface" />
      </>
    ),
  },
  {
    label: "Dark surfaces: the same mark, the wordmark in white",
    files: ["hadron-icon-color.svg", "hadron-horizontal-dark.svg"],
    dark: true,
    render: () => (
      <>
        <HadronMark height={64} label="Hadron mark on a dark surface" />
        <HadronLogo variant="dark" height={64} label="Hadron horizontal logo, dark surface" />
      </>
    ),
  },
  {
    label: "White, on a flat fill or photography: the mark alone",
    files: ["hadron-icon-white.svg"],
    flat: true,
    render: () => <HadronMark variant="white" height={64} label="Hadron mark, white" />,
  },
];

function Rows({ rows }: { rows: Row[] }) {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <section key={row.label}>
          <h3 className="mb-2 text-sm font-semibold text-ink">{row.label}</h3>
          <div
            className={
              row.flat
                ? "flex flex-wrap items-center gap-8 rounded-base bg-ink p-6 text-bg"
                : "flex flex-wrap items-center gap-8 rounded-base border border-line bg-surface p-6 text-ink"
            }
            data-theme={row.dark ? "dark" : undefined}
            style={row.dark ? { background: "var(--bg)", color: "var(--ink)" } : undefined}
          >
            {row.render()}
          </div>
          <p className="mt-1 font-mono text-xs text-muted">{row.files.join(" · ")}</p>
        </section>
      ))}
    </div>
  );
}

/** The Kairos artwork (CNCF, plus the decks' dark-surface lockup), each rendition on its intended surface. */
export function LogoGrid() {
  return <Rows rows={kairosRows} />;
}

/** The Hadron artwork from the decks, each rendition on its intended surface. */
export function HadronLogoGrid() {
  return <Rows rows={hadronRows} />;
}

/** Both horizontal lockups with their clear space drawn: one mark-height on every side. */
export function ClearSpace() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <figure className="m-0 flex flex-col items-center gap-1">
        <div className="inline-block rounded-base border border-dashed border-accent p-16">
          <KairosLogo height={64} label="Kairos logo with clear space" />
        </div>
        <figcaption className="font-mono text-xs text-muted">
          dashed line: one mark-height of clear space
        </figcaption>
      </figure>
      <figure className="m-0 flex flex-col items-center gap-1">
        <div className="inline-block rounded-base border border-dashed border-hadron-blue p-16">
          <HadronLogo height={64} label="Hadron logo with clear space" />
        </div>
        <figcaption className="font-mono text-xs text-muted">the same rule for Hadron</figcaption>
      </figure>
      <ul className="max-w-sm list-disc pl-5 text-sm text-ink">
        <li>Clear space on every side of the horizontal logo equals the height of the mark.</li>
        <li>Minimum height on screen: 24px, for the marks and for the lockups.</li>
        <li>Never on an orange or blue fill, over a tile field, recoloured, outlined or rotated.</li>
      </ul>
    </div>
  );
}
