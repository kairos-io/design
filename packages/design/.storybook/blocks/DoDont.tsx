import type { ReactNode } from "react";
import { DIAMOND_POINTS, DIAMOND_VIEWBOX } from "../../src/lib/diamond.ts";

function Column({ kind, children }: { kind: "do" | "dont"; children: ReactNode }) {
  const isDo = kind === "do";
  return (
    <div className="rounded-base bg-surface p-4 text-sm">
      <div
        className={`mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isDo ? "text-ok" : "text-status-recovery"}`}
      >
        <svg width="11" height="11" viewBox={DIAMOND_VIEWBOX} aria-hidden="true" className="fill-current">
          <polygon points={DIAMOND_POINTS} />
        </svg>
        {isDo ? "Do" : "Don't"}
      </div>
      <div className="flex flex-col gap-2 text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_p]:m-0">{children}</div>
    </div>
  );
}

/** Two columns: what to do and what not to do. Pass `do` and `dont` as children. */
export function DoDont({ do: doChildren, dont }: { do: ReactNode; dont: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Column kind="do">{doChildren}</Column>
      <Column kind="dont">{dont}</Column>
    </div>
  );
}
