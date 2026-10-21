import type { Tone } from "../tokens/index.ts";

export type { Tone };

// Phase strings come from the Kairos stores in mixed case ("Building",
// "Online") and from older code paths in lower case, so every comparison
// lowercases first. The table is AuroraBoot's.
const phaseTones: Record<string, Tone> = {
  online: "success",
  ready: "success",
  completed: "success",
  active: "success",
  healthy: "success",
  pending: "warning",
  queued: "warning",
  delivered: "warning",
  degraded: "warning",
  offline: "danger",
  failed: "danger",
  error: "danger",
  running: "info",
  building: "info",
  upgrading: "info",
  installing: "info",
};

/** Maps a node, build or deployment phase to its status tone; unknown phases are neutral. */
export function phaseTone(phase: string | null | undefined): Tone {
  return phaseTones[(phase ?? "").toLowerCase()] ?? "neutral";
}

// Written out in full so Tailwind finds every class in the source.

/** Solid tone background, for dots, bars and meters. */
export const toneBg: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-neutral",
};

/** Tone ink, for icons and numbers that carry a status. */
export const toneText: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  neutral: "text-neutral",
};

/** The soft fill: the tone at 15% behind its -foreground ink, with a 25% border. Badges, banners, step markers. */
export const toneSoft: Record<Tone, string> = {
  success: "bg-success/15 text-success-foreground border-success/25",
  warning: "bg-warning/15 text-warning-foreground border-warning/25",
  danger: "bg-danger/15 text-danger-foreground border-danger/25",
  info: "bg-info/15 text-info-foreground border-info/25",
  neutral: "bg-neutral/15 text-neutral-foreground border-neutral/25",
};
