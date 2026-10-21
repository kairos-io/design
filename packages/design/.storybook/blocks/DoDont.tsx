import type { ReactNode } from "react";

function Column({ kind, children }: { kind: "do" | "dont"; children: ReactNode }) {
  const isDo = kind === "do";
  return (
    <div
      className={`rounded-lg border p-4 text-sm ${
        isDo ? "border-success/25 bg-success/10" : "border-danger/25 bg-danger/10"
      }`}
    >
      <div
        className={`mb-2 text-xs font-semibold uppercase tracking-wider ${isDo ? "text-success-foreground" : "text-danger-foreground"}`}
      >
        {isDo ? "Do" : "Don't"}
      </div>
      <div className="flex flex-col gap-2 text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_p]:m-0">
        {children}
      </div>
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
