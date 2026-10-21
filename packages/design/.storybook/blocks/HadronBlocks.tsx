import type { ReactNode } from "react";
import { Button } from "../../src/components/Button/Button.tsx";
import { Chip } from "../../src/components/Chip/Chip.tsx";
import { StatusBadge } from "../../src/components/StatusBadge/StatusBadge.tsx";
import { Terminal } from "../../src/components/Terminal/Terminal.tsx";
import { variants, themeLight, themeDark, type ThemeToken } from "../../src/tokens/index.ts";

/** One row of components, as a product page shows them, to compare under the two brands. */
function Sample() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Download ISO</Button>
        <Button variant="outline">Read the docs</Button>
        <Button variant="link">Learn more →</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status="Healthy" />
        <StatusBadge status="Upgrading" />
        <Chip>hadron v0.5.1</Chip>
        <Chip>k3s 1.36</Chip>
      </div>
      <Terminal
        aria-label="Pull command"
        lines={["$ docker pull quay.io/kairos/hadron:v0.5.1"]}
        maxHeight={120}
      />
      <p className="text-sm text-sub">
        Hadron ships with every Kairos release.{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          Component versions →
        </a>
      </p>
    </div>
  );
}

/**
 * The same components under Kairos and under Hadron, side by side. The right
 * column is wrapped in data-variant="hadron" and nothing else changes: the
 * accent, the ink on it and the links take the Hadron values from tokens.json.
 */
export function BrandCompare({ children }: { children?: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-base border border-line bg-bg p-4">
        <h3 className="mb-3 font-mono text-xs text-muted">Kairos · no attribute</h3>
        {children ?? <Sample />}
      </section>
      <section className="rounded-base border border-line bg-bg p-4" data-variant="hadron">
        <h3 className="mb-3 font-mono text-xs text-muted">Hadron · data-variant="hadron"</h3>
        {children ?? <Sample />}
      </section>
    </div>
  );
}

const changed = Object.keys(variants.hadron.light) as ThemeToken[];
const kept: ThemeToken[] = [
  "accent-line",
  "accent-soft",
  "code-key",
  "bg",
  "surface",
  "line",
  "ink",
  "sub",
  "muted",
  "ok",
];

/** What the Hadron variant changes, with both themes' values, and what it leaves alone. */
export function HadronVariantTable() {
  const row = (name: ThemeToken, changes: boolean) => {
    const light = changes
      ? variants.hadron.light[name as keyof typeof variants.hadron.light]
      : themeLight[name];
    const dark = changes ? variants.hadron.dark[name as keyof typeof variants.hadron.dark] : themeDark[name];
    return (
      <tr key={name} className="border-b border-line">
        <td className="py-2 pr-3 font-mono text-xs">--{name}</td>
        <td className="py-2 pr-3">
          <span
            aria-hidden="true"
            className="mr-2 inline-block h-3 w-3 rounded-sm border border-line align-middle"
            style={{ background: light }}
          />
          <span className="font-mono text-xs">{light}</span>
        </td>
        <td className="py-2 pr-3">
          <span
            aria-hidden="true"
            className="mr-2 inline-block h-3 w-3 rounded-sm border border-line align-middle"
            style={{ background: dark }}
          />
          <span className="font-mono text-xs">{dark}</span>
        </td>
        <td className="py-2 text-muted">{changes ? "Hadron value" : "unchanged"}</td>
      </tr>
    );
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2 pr-3 font-medium">Token</th>
            <th className="py-2 pr-3 font-medium">Light</th>
            <th className="py-2 pr-3 font-medium">Dark</th>
            <th className="py-2 font-medium">Under hadron</th>
          </tr>
        </thead>
        <tbody>
          {changed.map((n) => row(n, true))}
          {kept.map((n) => row(n, false))}
        </tbody>
      </table>
    </div>
  );
}
