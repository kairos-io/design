import type { ReactNode } from "react";
import {
  brand,
  resolveTheme,
  status,
  themeDark,
  themeLight,
  toneTokens,
  tones,
  type ThemeToken,
  type Tone,
  type Variant,
} from "../../src/tokens/index.ts";
import { contrastOn, formatRatio, type ContrastResult } from "./contrast.ts";
import { DIAMOND_POINTS, DIAMOND_VIEWBOX } from "../../src/lib/diamond.ts";

/** One token: a live swatch that follows the page theme, its name, and both values. */
export function ColorSwatch({ name, light, dark }: { name: string; light: string; dark: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-base border border-line bg-surface p-3">
      <span
        aria-hidden="true"
        className="h-10 w-10 shrink-0 rounded-base border border-line"
        style={{ background: `var(--${name})` }}
      />
      <div className="min-w-0 text-sm">
        <div className="truncate font-mono text-xs font-semibold">--{name}</div>
        <div className="truncate text-xs text-muted">
          <span className="font-mono">{light}</span>
          <span className="px-1 opacity-50">/</span>
          <span className="font-mono">{dark}</span>
        </div>
      </div>
    </div>
  );
}

const groups: { title: string; note: string; names: ThemeToken[] }[] = [
  {
    title: "Canvas and surfaces",
    note: "The page, the sidebar, cards and inputs, and the tone steps above them. Elevation is a step from canvas to surface to raised; nothing casts a shadow.",
    names: ["bg", "side", "surface", "inner", "head", "hover", "raised"],
  },
  {
    title: "Ink",
    note: "Primary text, body copy on surfaces, and labels and metadata.",
    names: ["ink", "sub", "muted"],
  },
  {
    title: "Accent and links",
    note: "The one action that matters on a view and the active state. Ink on the accent is dark on Kairos orange and white on Hadron blue.",
    names: ["accent", "accent-soft", "accent-line", "on-accent", "link"],
  },
  {
    title: "Lines and status",
    note: "Hairlines and input borders, the healthy green for text, the warning tint, and the dialog scrim.",
    names: ["line", "ok", "warn-bg", "overlay"],
  },
  {
    title: "Code and the deep surface",
    note: "The terminal and code blocks keep a dark ground in both themes, with their own ink.",
    names: ["deep", "code", "code-bar", "code-key", "code-ink", "code-muted"],
  },
];

/** Every theme token, grouped by role, with a live swatch and both values. */
export function ColorGrid({ group }: { group?: string }) {
  const shown = group ? groups.filter((g) => g.title === group) : groups;
  return (
    <div className="flex flex-col gap-8">
      {shown.map((g) => (
        <section key={g.title}>
          <h3 className="mb-1 text-base font-semibold">{g.title}</h3>
          <p className="mb-3 text-sm text-muted">{g.note}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {g.names.map((n) => (
              <ColorSwatch key={n} name={n} light={themeLight[n]} dark={themeDark[n]} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type Fixed = { name: string; value: string; label: string; use: string };

const kairosEntries: Fixed[] = [
  {
    name: "kairos-light",
    value: brand["kairos-light"],
    label: "Light",
    use: "The top rhombus of the mark. Soft accent in the dark theme.",
  },
  {
    name: "kairos-mid",
    value: brand["kairos-mid"],
    label: "Mid",
    use: "The left rhombus. The accent and links in the dark theme.",
  },
  {
    name: "kairos-orange",
    value: brand["kairos-orange"],
    label: "Kairos orange",
    use: "The right rhombus. The accent in the light theme.",
  },
];

const hadronEntries: Fixed[] = [
  {
    name: "hadron-sky",
    value: brand["hadron-sky"],
    label: "Sky",
    use: "The light tile. Links in the dark theme under the Hadron variant.",
  },
  {
    name: "hadron-blue",
    value: brand["hadron-blue"],
    label: "Hadron blue",
    use: "The accent under the Hadron variant, with white ink.",
  },
  {
    name: "hadron-deep",
    value: brand["hadron-deep"],
    label: "Deep",
    use: "The dark tile. Small text on blue uses Deep, where white reaches 7.2:1.",
  },
];

const statusEntries: Fixed[] = [
  {
    name: "status-healthy",
    value: status.healthy,
    label: "Healthy",
    use: "The node-state diamond for healthy and ready.",
  },
  {
    name: "status-warning",
    value: status.warning,
    label: "Warning",
    use: "Degraded, pending, the CPU diamond in the console.",
  },
  {
    name: "status-recovery",
    value: status.recovery,
    label: "Recovery",
    use: "Recovery, failed, the destructive button.",
  },
  {
    name: "status-ink",
    value: status.ink,
    label: "Ink on status",
    use: "White, for text on a status fill such as the destructive button.",
  },
];

function FixedGrid({ entries }: { entries: Fixed[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(({ name, value, label, use }) => (
        <div key={name} className="flex gap-3 rounded-base border border-line bg-surface p-3">
          <span
            aria-hidden="true"
            className="h-14 w-14 shrink-0 rounded-base border border-line"
            style={{ background: value }}
          />
          <div className="min-w-0 text-sm">
            <div className="font-semibold">{label}</div>
            <div className="font-mono text-xs text-muted">
              --{name} · {value}
            </div>
            <div className="mt-1 text-xs text-muted">{use}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** The Kairos oranges, in the order of the mark. They do not change with the theme. */
export function BrandPalette() {
  return <FixedGrid entries={kairosEntries} />;
}

/** The Hadron blues: the secondary brand, the same three-tile structure in blue. */
export function HadronPalette() {
  return <FixedGrid entries={hadronEntries} />;
}

/** The node-state colours and the ink that sits on them. */
export function StatusPalette() {
  return <FixedGrid entries={statusEntries} />;
}

function Level({ result }: { result: ContrastResult | null }) {
  if (!result) return <span className="text-muted">n/a</span>;
  const cls =
    result.level === "fail"
      ? "text-status-recovery"
      : result.level === "AA large"
        ? "text-status-warning"
        : "text-ok";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-sm border border-line bg-surface px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}
    >
      {formatRatio(result.ratio)} {result.level}
    </span>
  );
}

type Pair = { label: string; ink: ThemeToken | "status-ink"; surface: ThemeToken; large?: boolean };

const pairs: Pair[] = [
  { label: "Primary text on the page", ink: "ink", surface: "bg" },
  { label: "Body copy on a surface", ink: "sub", surface: "surface" },
  { label: "Labels and metadata on the page", ink: "muted", surface: "bg" },
  { label: "Labels and metadata on a surface", ink: "muted", surface: "surface" },
  { label: "Links on the page", ink: "link", surface: "bg" },
  { label: "Links on a surface", ink: "link", surface: "surface" },
  { label: "Primary button label", ink: "on-accent", surface: "accent" },
  { label: "Accent as a line or large text on the page", ink: "accent", surface: "bg", large: true },
  { label: "Dark button label (bg on ink)", ink: "bg", surface: "ink" },
  { label: "Healthy text on the page", ink: "ok", surface: "bg" },
  { label: "Terminal text", ink: "code-ink", surface: "code" },
  { label: "Terminal bar text", ink: "code-muted", surface: "code-bar" },
];

type Column = { label: string; mode: "light" | "dark"; variant?: Variant };

const columns: Column[] = [
  { label: "Kairos light", mode: "light" },
  { label: "Kairos dark", mode: "dark" },
  { label: "Hadron light", mode: "light", variant: "hadron" },
  { label: "Hadron dark", mode: "dark", variant: "hadron" },
];

function value(col: Column, name: ThemeToken | "status-ink"): string {
  if (name === "status-ink") return status.ink;
  return resolveTheme(col.mode, col.variant)[name];
}

function measure(col: Column, p: Pair): ContrastResult | null {
  return contrastOn(value(col, p.ink), value(col, p.surface), value(col, "bg"));
}

/**
 * Computed WCAG ratios for the pairs the components actually put together,
 * in both themes, as Kairos and as Hadron (data-variant="hadron"). The one
 * pair that changes between the brands is the accent: dark ink on Kairos
 * orange passes AA, white on Hadron blue passes only for large or bold text.
 */
export function ContrastTable() {
  return (
    <div className="overflow-x-auto">
      <table className="sb-unstyled w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2 pr-3 font-medium">Pair</th>
            {columns.map((c) => (
              <th key={c.label} className="py-2 pr-3 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pairs.map((p) => (
            <tr key={p.label} className="border-b border-line">
              <td className="py-2 pr-3">
                {p.label}
                <div className="font-mono text-xs text-muted">
                  --{p.ink} on --{p.surface}
                  {p.large ? " · 3:1 is enough" : ""}
                </div>
              </td>
              {columns.map((c) => (
                <td key={c.label} className="py-2 pr-3">
                  <Level result={measure(c, p)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const toneMeaning: Record<Tone, string> = {
  success: "healthy, ready, completed",
  warning: "degraded, pending, queued",
  danger: "recovery, failed, offline",
  info: "upgrading, installing, building",
  neutral: "unknown, not applicable",
};

/** The five tones as the decks draw them: a coloured diamond beside ink text on a surface. */
export function ToneRow({ children }: { children?: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {tones.map((t) => (
        <div key={t} className="rounded-base border border-line bg-surface p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <svg width="11" height="11" viewBox={DIAMOND_VIEWBOX} aria-hidden="true">
              <polygon points={DIAMOND_POINTS} style={{ fill: `var(--${toneTokens[t].fill})` }} />
            </svg>
            {t}
          </div>
          <div className="mt-2 font-mono text-xs text-muted">
            --{toneTokens[t].fill} · --{toneTokens[t].ink}
          </div>
          <div className="mt-1 text-xs text-muted">{toneMeaning[t]}</div>
        </div>
      ))}
      {children}
    </div>
  );
}
