import { typography } from "../../src/tokens/index.ts";

const where: Record<keyof typeof typography.scale, string> = {
  display: "Marketing headlines on kairos.io.",
  h1: "Page title. Bold, tight tracking.",
  h2: "Section title. Bold.",
  h3: "Card group title. Semibold.",
  h4: "Card title and dialog title. Semibold.",
  lead: "Page description under a title.",
  "body-lg": "Body on the docs site.",
  body: "Body in the apps. The default.",
  small: "Help text, meta lines, errors.",
  caption: "Badges, chips, table captions.",
  overline: "Sidebar section labels, uppercase, 0.05em tracking.",
};

const weight: Partial<Record<keyof typeof typography.scale, number>> = {
  display: 700,
  h1: 700,
  h2: 700,
  h3: 600,
  h4: 600,
  overline: 500,
  caption: 600,
};

/** Every step of the type scale rendered at its size, with the pixel values and where it is used. */
export function TypeScale() {
  const steps = Object.entries(typography.scale).reverse() as [
    keyof typeof typography.scale,
    readonly [number, number, string],
  ][];
  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
      {steps.map(([name, [size, line, tracking]]) => (
        <div key={name} className="grid gap-2 p-4 sm:grid-cols-[8rem_1fr]">
          <div className="text-xs text-muted-foreground">
            <div className="font-mono font-semibold text-foreground">{name}</div>
            <div className="font-mono">
              {size}/{line}
              {tracking !== "normal" ? ` ${tracking}` : ""}
            </div>
            <div className="mt-1">{where[name]}</div>
          </div>
          <div
            className="min-w-0 break-words text-foreground"
            style={{
              fontSize: size,
              lineHeight: `${line}px`,
              letterSpacing: tracking,
              fontWeight: weight[name] ?? 400,
              textTransform: name === "overline" ? "uppercase" : undefined,
            }}
          >
            {name === "overline" ? "Fleet" : "Immutable Kubernetes at the edge"}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The weights the apps and docs load. */
export function Weights() {
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {Object.entries(typography.weights).map(([name, w]) => (
        <div key={name} className="rounded-lg border border-border bg-card p-3">
          <div className="text-2xl text-foreground" style={{ fontWeight: w }}>
            Kairos
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {name} <span className="font-mono">{w}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** The two font stacks, shown in themselves. */
export function FontStacks() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-lg text-foreground" style={{ fontFamily: typography.family.sans }}>
          Noto Sans, the brand face
        </div>
        <div className="mt-2 break-words font-mono text-xs text-muted-foreground">
          {typography.family.sans}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-lg text-foreground" style={{ fontFamily: typography.family.mono }}>
          ui-monospace, for logs and references
        </div>
        <div className="mt-2 break-words font-mono text-xs text-muted-foreground">
          {typography.family.mono}
        </div>
      </div>
    </div>
  );
}
