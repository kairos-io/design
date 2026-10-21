import type { ReactNode } from "react";
import { brand, semanticDark, semanticLight, tones, type SemanticToken } from "../../src/tokens/index.ts";
import { contrastOn, formatRatio, toneContrast, type ContrastResult } from "./contrast.ts";

/** One token: a live swatch that follows the page theme, its name, and both values. */
export function ColorSwatch({ name, light, dark }: { name: string; light: string; dark: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-card p-3">
      <span
        aria-hidden="true"
        className="h-10 w-10 shrink-0 rounded-md border border-border"
        style={{ background: `var(--${name})` }}
      />
      <div className="min-w-0 text-sm">
        <div className="truncate font-mono text-xs font-semibold">--{name}</div>
        <div className="truncate text-xs text-muted-foreground">
          <span className="font-mono">{light}</span>
          <span className="px-1 opacity-50">/</span>
          <span className="font-mono">{dark}</span>
        </div>
      </div>
    </div>
  );
}

const groups: { title: string; note: string; names: SemanticToken[] }[] = [
  {
    title: "Surfaces and ink",
    note: "Page, card and popover backgrounds with the text that sits on them.",
    names: ["background", "foreground", "card", "card-foreground", "popover", "popover-foreground"],
  },
  {
    title: "Primary",
    note: "The brand orange for the one action that matters on a view. primary-soft is the selected-choice fill.",
    names: ["primary", "primary-hover", "primary-foreground", "primary-soft"],
  },
  {
    title: "Secondary, muted and accent",
    note: "Quiet fills: secondary buttons, hover states, table rows and inputs.",
    names: ["secondary", "secondary-foreground", "muted", "muted-foreground", "accent", "accent-foreground"],
  },
  {
    title: "Lines and focus",
    note: "Borders, input borders and the focus ring.",
    names: ["border", "input", "ring"],
  },
  {
    title: "Status tones",
    note: "Each tone has a solid value for dots and bars and a -foreground ink for text on its 15% fill.",
    names: [
      "success",
      "success-foreground",
      "warning",
      "warning-foreground",
      "danger",
      "danger-foreground",
      "info",
      "info-foreground",
      "neutral",
      "neutral-foreground",
      "destructive",
      "destructive-foreground",
    ],
  },
  {
    title: "Navy chrome",
    note: "The sidebar and top bar are navy in both themes; the terminal panel too.",
    names: [
      "navy",
      "sidebar-bg",
      "sidebar-fg",
      "sidebar-accent",
      "sidebar-muted",
      "terminal-bg",
      "terminal-fg",
      "terminal-error",
    ],
  },
];

/** Every semantic token, grouped by role, with a live swatch and both values. */
export function ColorGrid({ group }: { group?: string }) {
  const shown = group ? groups.filter((g) => g.title === group) : groups;
  return (
    <div className="flex flex-col gap-8">
      {shown.map((g) => (
        <section key={g.title}>
          <h3 className="mb-1 text-base font-semibold">{g.title}</h3>
          <p className="mb-3 text-sm text-muted-foreground">{g.note}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {g.names.map((n) => (
              <ColorSwatch key={n} name={n} light={semanticLight[n]} dark={semanticDark[n]} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const brandEntries: { key: keyof typeof brand; label: string; use: string }[] = [
  {
    key: "orange",
    label: "Kairos orange",
    use: "Primary actions in the light theme. The darkest rhombi of the mark.",
  },
  { key: "orangeSoft", label: "Soft orange", use: "Hover in light, primary in dark. The mid rhombi." },
  { key: "orangeSofter", label: "Softer orange", use: "Accents and illustration only. The lightest rhombi." },
  { key: "navy", label: "Navy", use: "Sidebar, top bar, docs navbar and footer, the terminal panel." },
  { key: "white", label: "White", use: "Page background in the light theme; ink on orange." },
  { key: "gray", label: "Gray", use: "Card borders on the docs site." },
  { key: "grayBlue", label: "Gray blue", use: "The docs' secondary surface." },
];

/** The brand palette: the artwork fills and the navy, with where each is used. */
export function BrandPalette() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {brandEntries.map(({ key, label, use }) => (
        <div key={key} className="flex gap-3 rounded-lg border border-border bg-card p-3">
          <span
            aria-hidden="true"
            className="h-14 w-14 shrink-0 rounded-md border border-border"
            style={{ background: brand[key] }}
          />
          <div className="min-w-0 text-sm">
            <div className="font-semibold">{label}</div>
            <div className="font-mono text-xs text-muted-foreground">{brand[key]}</div>
            <div className="mt-1 text-xs text-muted-foreground">{use}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Level({ result }: { result: ContrastResult | null }) {
  if (!result) return <span className="text-muted-foreground">n/a</span>;
  const tone = result.level === "fail" ? "danger" : result.level === "AA large" ? "warning" : "success";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-2 py-0.5 text-xs font-semibold bg-${tone}/15 text-${tone}-foreground border-${tone}/25`}
    >
      {formatRatio(result.ratio)} {result.level}
    </span>
  );
}

// Written out so Tailwind keeps the classes Level composes.
const _toneClasses = [
  "bg-success/15 text-success-foreground border-success/25",
  "bg-warning/15 text-warning-foreground border-warning/25",
  "bg-danger/15 text-danger-foreground border-danger/25",
];
void _toneClasses;

type Pair = { label: string; ink: SemanticToken; surface: SemanticToken; soft?: boolean };

const pairs: Pair[] = [
  { label: "Body text on the page", ink: "foreground", surface: "background" },
  { label: "Muted text on the page", ink: "muted-foreground", surface: "background" },
  { label: "Card text on a card", ink: "card-foreground", surface: "card" },
  { label: "Primary button label", ink: "primary-foreground", surface: "primary" },
  { label: "Secondary button label", ink: "secondary-foreground", surface: "secondary" },
  { label: "Sidebar text on navy", ink: "sidebar-fg", surface: "sidebar-bg" },
  ...tones.map((t) => ({
    label: `${t} badge ink on its 15% fill`,
    ink: `${t}-foreground` as SemanticToken,
    surface: t as SemanticToken,
    soft: true,
  })),
];

function resolve(theme: Record<SemanticToken, string>, name: SemanticToken): string {
  const v = theme[name];
  const ref = v.match(/^var\(--([a-z-]+)\)$/);
  return ref ? resolve(theme, ref[1] as SemanticToken) : v;
}

function measure(theme: Record<SemanticToken, string>, p: Pair): ContrastResult | null {
  const ink = resolve(theme, p.ink);
  const surface = resolve(theme, p.surface);
  const background = resolve(theme, "background");
  return p.soft ? toneContrast(surface, ink, background) : contrastOn(ink, surface, background);
}

/** Computed WCAG ratios for the pairs the components actually put together, in both themes. */
export function ContrastTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Pair</th>
            <th className="py-2 pr-3 font-medium">Light</th>
            <th className="py-2 font-medium">Dark</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((p) => (
            <tr key={p.label} className="border-b border-border">
              <td className="py-2 pr-3">
                {p.label}
                <div className="font-mono text-xs text-muted-foreground">
                  --{p.ink} on --{p.surface}
                  {p.soft ? " / 15%" : ""}
                </div>
              </td>
              <td className="py-2 pr-3">
                <Level result={measure(semanticLight, p)} />
              </td>
              <td className="py-2">
                <Level result={measure(semanticDark, p)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The five tones side by side, as the StatusBadge, StatusDot and Alert render them. */
export function ToneRow({ children }: { children?: ReactNode }) {
  const meaning: Record<(typeof tones)[number], string> = {
    success: "online, ready, completed",
    warning: "pending, queued, degraded",
    danger: "offline, failed, error",
    info: "running, building, upgrading",
    neutral: "unknown, not applicable",
  };
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {tones.map((t) => (
        <div key={t} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full bg-${t}`} />
            <span
              className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-${t}/15 text-${t}-foreground border-${t}/25`}
            >
              {t}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{meaning[t]}</div>
        </div>
      ))}
      {children}
    </div>
  );
}

// Written out so Tailwind keeps the classes ToneRow composes.
const _toneRowClasses = [
  "bg-success bg-warning bg-danger bg-info bg-neutral",
  "bg-info/15 text-info-foreground border-info/25",
  "bg-neutral/15 text-neutral-foreground border-neutral/25",
];
void _toneRowClasses;
