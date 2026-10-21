import { font, type TypeStep } from "../../src/tokens/index.ts";

const where: Record<TypeStep, string> = {
  display: "The one line on a homepage hero.",
  h1: "Page title.",
  h2: "Section title.",
  h3: "Card group and dialog titles.",
  "body-lg": "Lead paragraph under a title; body on the docs site.",
  body: "Body everywhere else. The default.",
  label: "Form labels, buttons, tabs, table headers.",
  mono: "Commands, versions, hostnames, metadata. Martian Mono.",
};

const samples: Record<TypeStep, string> = {
  display: "Bring any Linux.",
  h1: "Run it immutable",
  h2: "One platform, every stage",
  h3: "A/B atomic upgrades",
  "body-lg": "Kairos builds, boots, upgrades and recovers machines.",
  body: "Every action in the console maps to a CLI command and an API call.",
  label: "Target disk",
  mono: "kairos fleet rollout --group retail-eu",
};

/** Every step of the type scale at its size, with the spec and where it is used. */
export function TypeScale() {
  const steps = Object.entries(font.size) as [TypeStep, (typeof font.size)[TypeStep]][];
  return (
    <div className="flex flex-col divide-y divide-line rounded-base border border-line bg-surface">
      {steps.map(([name, spec]) => (
        <div key={name} className="grid gap-2 p-4 sm:grid-cols-[8rem_1fr]">
          <div className="text-xs text-muted">
            <div className="font-mono font-semibold text-ink">{name}</div>
            <div className="font-mono">
              {spec.size} / {spec.weight}
              {spec.tracking !== "0em" ? ` / ${spec.tracking}` : ""}
              {"lineHeight" in spec ? ` / ${spec.lineHeight}` : ""}
            </div>
            <div className="mt-1">{where[name]}</div>
          </div>
          <div
            className="min-w-0 break-words text-ink"
            style={{
              fontFamily: name === "mono" ? "var(--font-mono)" : "var(--font-sans)",
              fontSize: `min(${spec.size}, 12vw)`,
              lineHeight: "lineHeight" in spec ? spec.lineHeight : 1.1,
              letterSpacing: spec.tracking,
              fontWeight: spec.weight,
            }}
          >
            {samples[name]}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The weights the fonts ship with. */
export function Weights() {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {Object.entries(font.weight).map(([name, w]) => (
        <div key={name} className="rounded-base border border-line bg-surface p-3">
          <div className="text-2xl text-ink" style={{ fontWeight: w }}>
            Kairos
          </div>
          <div className="mt-1 text-xs text-muted">
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
      <div className="rounded-base border border-line bg-surface p-3">
        <div className="text-lg text-ink" style={{ fontFamily: "var(--font-sans)" }}>
          Urbanist, for everything people read
        </div>
        <div className="mt-2 break-words font-mono text-xs text-muted">{font.family.sans}</div>
      </div>
      <div className="rounded-base border border-line bg-surface p-3">
        <div className="text-lg text-ink" style={{ fontFamily: "var(--font-mono)" }}>
          Martian Mono, for commands and metadata
        </div>
        <div className="mt-2 break-words font-mono text-xs text-muted">{font.family.mono}</div>
      </div>
    </div>
  );
}
