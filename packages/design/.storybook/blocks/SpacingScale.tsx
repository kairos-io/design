import { breakpoints, layout, space } from "../../src/tokens/index.ts";

/** The spacing scale as bars, with the pixel value, the token and the Tailwind step. */
export function SpacingScale() {
  const max = space[space.length - 1];
  return (
    <div className="flex flex-col gap-1.5">
      {space.map((px) => (
        <div key={px} className="grid grid-cols-[6rem_1fr] items-center gap-3 text-xs">
          <div className="font-mono text-muted">
            <span className="font-semibold text-ink">{px}px</span> · --space-{px} · {px / 4}
          </div>
          <div
            className="h-4 rounded-sm bg-accent"
            style={{ width: `${(px / max) * 100}%` }}
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  );
}

const breakpointUse: Record<keyof typeof breakpoints, string> = {
  sm: "Two columns in a card grid.",
  md: "The console sidebar is a drawer below this.",
  lg: "Sidebar labels show; the review step goes two-column.",
  xl: "The page measure, --page-max.",
  "2xl": "Unused by the Kairos surfaces today.",
};

/** Min-width breakpoints, mobile first. Tailwind's defaults, which the components use through sm:, md:, lg:. */
export function Breakpoints() {
  return (
    <table className="sb-unstyled w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left text-muted">
          <th className="py-2 pr-3 font-medium">Prefix</th>
          <th className="py-2 pr-3 font-medium">Min width</th>
          <th className="py-2 font-medium">Use</th>
        </tr>
      </thead>
      <tbody>
        {(Object.keys(breakpoints) as (keyof typeof breakpoints)[]).map((k) => (
          <tr key={k} className="border-b border-line">
            <td className="py-2 pr-3 font-mono text-xs">{k}:</td>
            <td className="py-2 pr-3 font-mono">{breakpoints[k]}px</td>
            <td className="py-2">{breakpointUse[k]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The fixed measures pages share. */
export function LayoutMeasures() {
  return (
    <table className="sb-unstyled w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left text-muted">
          <th className="py-2 pr-3 font-medium">Measure</th>
          <th className="py-2 pr-3 font-medium">Token</th>
          <th className="py-2 font-medium">Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(layout).map(([k, v]) => (
          <tr key={k} className="border-b border-line">
            <td className="py-2 pr-3">Page max width</td>
            <td className="py-2 pr-3 font-mono text-xs">--{k}</td>
            <td className="py-2 font-mono">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
