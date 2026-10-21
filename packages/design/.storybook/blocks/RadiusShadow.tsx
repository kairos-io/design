import { motion, radius, shadows } from "../../src/tokens/index.ts";

const radiusUse: Record<keyof typeof radius, string> = {
  base: "The --radius every step derives from.",
  sm: "Chip remove buttons, theme switch segments.",
  md: "Buttons, inputs, badges, sidebar items.",
  lg: "Choice cards, banners, tab lists.",
  xl: "Cards, dialogs, the terminal panel.",
  full: "Dots, step markers, avatars.",
};

/** Each radius step on a card-coloured square. */
export function RadiusScale() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {(Object.keys(radius) as (keyof typeof radius)[]).map((k) => (
        <div key={k} className="flex gap-3 rounded-lg border border-border bg-card p-3">
          <span
            aria-hidden="true"
            className="h-14 w-14 shrink-0 border border-border bg-muted"
            style={{ borderRadius: k === "base" ? "var(--radius)" : `var(--radius-${k})` }}
          />
          <div className="min-w-0 text-xs">
            <div className="font-mono font-semibold text-foreground">
              {k === "base" ? "--radius" : `--radius-${k}`}
            </div>
            <div className="font-mono text-muted-foreground">{radius[k]}</div>
            <div className="mt-1 text-muted-foreground">{radiusUse[k]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const shadowUse: Record<keyof typeof shadows, string> = {
  sm: "Buttons and inputs: a hint of lift.",
  md: "Select and dropdown menus.",
  lg: "Dialogs, popovers, the mobile drawer.",
  xl: "Unused by the apps today.",
  "2xl": "Unused by the apps today.",
  focus: "The focus ring: one pixel of --ring.",
};

/** Each shadow on a card. Cards themselves use the Tailwind default `shadow`, which equals --shadow-sm. */
export function ShadowScale() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {(Object.keys(shadows) as (keyof typeof shadows)[]).map((k) => (
        <div
          key={k}
          className="rounded-xl border border-border bg-card p-4"
          style={{ boxShadow: `var(--shadow-${k})` }}
        >
          <div className="font-mono text-xs font-semibold text-foreground">--shadow-{k}</div>
          <div className="mt-1 text-xs text-muted-foreground">{shadowUse[k]}</div>
        </div>
      ))}
    </div>
  );
}

/** The durations and easing, with a live fade-up you can replay. */
export function MotionTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted-foreground">
          <th className="py-2 pr-3 font-medium">Token</th>
          <th className="py-2 pr-3 font-medium">Value</th>
          <th className="py-2 font-medium">Use</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-border">
          <td className="py-2 pr-3 font-mono text-xs">--duration-fast</td>
          <td className="py-2 pr-3 font-mono">{motion.duration.fast}</td>
          <td className="py-2">Colour and opacity changes on hover.</td>
        </tr>
        <tr className="border-b border-border">
          <td className="py-2 pr-3 font-mono text-xs">--duration-base</td>
          <td className="py-2 pr-3 font-mono">{motion.duration.base}</td>
          <td className="py-2">Drawers, dialogs, menus opening.</td>
        </tr>
        <tr className="border-b border-border">
          <td className="py-2 pr-3 font-mono text-xs">--duration-slow</td>
          <td className="py-2 pr-3 font-mono">{motion.duration.slow}</td>
          <td className="py-2">The fade-up entrance of wizard panels and banners.</td>
        </tr>
        <tr className="border-b border-border">
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
        <div key={cls} className={`rounded-lg border border-border bg-card p-4 text-sm ${cls}`}>
          <div className="font-semibold text-foreground">Step {i + 1}</div>
          <div className="font-mono text-xs text-muted-foreground">.{cls}</div>
        </div>
      ))}
    </div>
  );
}
