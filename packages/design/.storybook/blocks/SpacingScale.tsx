import { breakpoints, layout, spacing } from "../../src/tokens/index.ts";

/** The 4px scale as bars, with the Tailwind step and the pixel value. */
export function SpacingScale() {
  return (
    <div className="flex flex-col gap-1.5">
      {spacing.steps.map((step) => {
        const px = step * spacing.base;
        return (
          <div key={step} className="grid grid-cols-[3rem_4rem_1fr] items-center gap-3 text-xs">
            <span className="font-mono font-semibold text-foreground">{step}</span>
            <span className="font-mono text-muted-foreground">{px}px</span>
            <span
              aria-hidden="true"
              className="h-4 rounded-sm bg-primary"
              style={{ width: Math.max(px, 2) }}
            />
          </div>
        );
      })}
    </div>
  );
}

const breakpointUse: Record<keyof typeof breakpoints, string> = {
  sm: "Two-column swatch and card grids.",
  md: "The sidebar stops being a drawer and becomes an icon rail.",
  lg: "The sidebar shows its labels; the review aside sits beside the editor.",
  xl: "Unused by the apps today.",
  "2xl": "Unused by the apps today.",
};

/** The min-width breakpoints with what changes at each. */
export function Breakpoints() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted-foreground">
          <th className="py-2 pr-3 font-medium">Name</th>
          <th className="py-2 pr-3 font-medium">Min width</th>
          <th className="py-2 font-medium">What changes</th>
        </tr>
      </thead>
      <tbody>
        {(Object.keys(breakpoints) as (keyof typeof breakpoints)[]).map((k) => (
          <tr key={k} className="border-b border-border">
            <td className="py-2 pr-3 font-mono font-semibold">{k}</td>
            <td className="py-2 pr-3 font-mono">{breakpoints[k]}px</td>
            <td className="py-2">{breakpointUse[k]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const layoutLabel: Record<keyof typeof layout, string> = {
  sidebarWidth: "Sidebar, full",
  sidebarRailWidth: "Sidebar, icon rail",
  sidebarDrawerWidth: "Sidebar, drawer below md",
  topbarHeight: "Top bar",
  contentMaxWidth: "Content max width",
  narrowMaxWidth: "Narrow page max width",
  fieldMaxWidth: "Form field max width",
};

/** The fixed measures the app shell and forms share. */
export function LayoutMeasures() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted-foreground">
          <th className="py-2 pr-3 font-medium">Measure</th>
          <th className="py-2 pr-3 font-medium">Token</th>
          <th className="py-2 font-medium">Value</th>
        </tr>
      </thead>
      <tbody>
        {(Object.keys(layout) as (keyof typeof layout)[]).map((k) => (
          <tr key={k} className="border-b border-border">
            <td className="py-2 pr-3">{layoutLabel[k]}</td>
            <td className="py-2 pr-3 font-mono text-xs">layout.{k}</td>
            <td className="py-2 font-mono">{layout[k]}px</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
