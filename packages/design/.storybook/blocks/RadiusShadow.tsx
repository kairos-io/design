import { motion, radius } from "../../src/tokens/index.ts";

const radiusUse: Record<keyof typeof radius, string> = {
  sm: "Tags, chips, status diamonds' chips.",
  base: "Everything else: buttons, inputs, cards, tabs, code blocks.",
  lg: "Dialogs.",
  full: "Dots and the one pill: the theme switch segments.",
};

/** Each radius step on a surface-coloured square. */
export function RadiusScale() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {(Object.keys(radius) as (keyof typeof radius)[]).map((k) => (
        <div key={k} className="flex gap-3 rounded-base border border-line bg-surface p-3">
          <span
            aria-hidden="true"
            className="h-14 w-14 shrink-0 border border-line bg-raised"
            style={{ borderRadius: `var(--radius-${k})` }}
          />
          <div className="min-w-0 text-xs">
            <div className="font-mono font-semibold text-ink">--radius-{k}</div>
            <div className="font-mono text-muted">{radius[k]}</div>
            <div className="mt-1 text-muted">{radiusUse[k]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Elevation without shadows: the three tone steps, canvas, surface and raised, nested. */
export function ElevationSteps() {
  return (
    <div className="rounded-base border border-line bg-bg p-4">
      <div className="font-mono text-xs text-muted">--bg · the canvas</div>
      <div className="mt-3 rounded-base bg-surface p-4">
        <div className="font-mono text-xs text-muted">--surface · cards, inputs, tables</div>
        <div className="mt-3 rounded-base bg-raised p-4">
          <div className="font-mono text-xs text-muted">--raised · headers, segmented tracks, tags</div>
        </div>
      </div>
    </div>
  );
}

/** The durations and easing, with a live fade-up you can replay. */
export function MotionTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left text-muted">
          <th className="py-2 pr-3 font-medium">Token</th>
          <th className="py-2 pr-3 font-medium">Value</th>
          <th className="py-2 font-medium">Use</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-line">
          <td className="py-2 pr-3 font-mono text-xs">--duration-fast</td>
          <td className="py-2 pr-3 font-mono">{motion.duration.fast}</td>
          <td className="py-2">Colour and opacity changes on hover.</td>
        </tr>
        <tr className="border-b border-line">
          <td className="py-2 pr-3 font-mono text-xs">--duration-base</td>
          <td className="py-2 pr-3 font-mono">{motion.duration.base}</td>
          <td className="py-2">Drawers, dialogs, menus opening.</td>
        </tr>
        <tr className="border-b border-line">
          <td className="py-2 pr-3 font-mono text-xs">--duration-slow</td>
          <td className="py-2 pr-3 font-mono">{motion.duration.slow}</td>
          <td className="py-2">The fade-up entrance of wizard panels and banners; tiles landing.</td>
        </tr>
        <tr className="border-b border-line">
          <td className="py-2 pr-3 font-mono text-xs">--ease-out</td>
          <td className="py-2 pr-3 font-mono">{motion.easing}</td>
          <td className="py-2">Ease-out quint: fast start, long settle.</td>
        </tr>
      </tbody>
    </table>
  );
}

/** Three cards entering with the staggered fade-up. Remount to replay. */
export function FadeUpDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {["animate-fade-up", "animate-fade-up-delay-1", "animate-fade-up-delay-2"].map((cls, i) => (
        <div key={cls} className={`rounded-base border border-line bg-surface p-4 text-sm ${cls}`}>
          <div className="font-semibold text-ink">Step {i + 1}</div>
          <div className="font-mono text-xs text-muted">.{cls}</div>
        </div>
      ))}
    </div>
  );
}
