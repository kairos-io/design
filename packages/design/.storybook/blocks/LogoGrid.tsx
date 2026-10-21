type Layout = "icon" | "horizontal" | "stacked";
type Variant = "color" | "white" | "black";

const layouts: Layout[] = ["icon", "horizontal", "stacked"];

// Each variant is shown on the surface it is meant for: colour on the page,
// white on navy, black on white. The files are the CNCF artwork, unchanged,
// served from src/assets/logos by Storybook's staticDirs.
const surfaces: { variant: Variant; label: string; className: string; style?: React.CSSProperties }[] = [
  { variant: "color", label: "Colour, on light and dark pages", className: "bg-bg" },
  {
    variant: "white",
    label: "White, on navy and photographs",
    className: "",
    style: { background: "var(--ink)" },
  },
  {
    variant: "black",
    label: "Black, on white print and one-colour uses",
    className: "",
    style: { background: "var(--surface)" },
  },
];

/** The nine artwork files, each on its intended surface. */
export function LogoGrid() {
  return (
    <div className="flex flex-col gap-4">
      {surfaces.map(({ variant, label, className, style }) => (
        <section key={variant}>
          <h3 className="mb-2 text-sm font-semibold text-ink">{label}</h3>
          <div
            className={`grid gap-3 rounded-base border border-line p-4 sm:grid-cols-3 ${className}`}
            style={style}
          >
            {layouts.map((layout) => {
              const file = `kairos-${layout}-${variant}.svg`;
              return (
                <figure key={layout} className="flex min-w-0 flex-col items-center gap-2">
                  <img
                    src={`logos/${file}`}
                    alt={`Kairos ${layout} ${variant} logo`}
                    className="h-20 w-auto max-w-full"
                  />
                  <figcaption
                    className={variant === "color" ? "font-mono text-xs text-muted" : "font-mono text-xs"}
                    style={
                      variant === "color"
                        ? undefined
                        : { color: variant === "white" ? "var(--surface)" : "var(--ink)" }
                    }
                  >
                    {file}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/** The mark with its clear space drawn: one rhombus height on every side. */
export function ClearSpace() {
  // The icon is 137 units square and a rhombus is 24.8 units tall, so the
  // clear space is 18% of the mark's height.
  return (
    <div className="flex flex-wrap items-start gap-6">
      <figure className="m-0 flex flex-col items-center gap-1">
        <div className="inline-block rounded-base border border-dashed border-accent p-[22px]">
          <img
            src="logos/kairos-icon-color.svg"
            alt="Kairos mark with clear space"
            className="block h-[120px] w-[120px]"
          />
        </div>
        <figcaption className="font-mono text-[10px] text-accent">
          dashed line: one rhombus of clear space
        </figcaption>
      </figure>
      <ul className="max-w-sm list-disc pl-5 text-sm text-ink">
        <li>Clear space on every side equals the height of one rhombus, 18% of the mark's height.</li>
        <li>
          Minimum size: 24px for the icon, 120px wide for the horizontal logo, 80px wide for the stacked one.
        </li>
        <li>Never recolour, rotate, outline, add effects to, or set the mark on a busy image.</li>
      </ul>
    </div>
  );
}
