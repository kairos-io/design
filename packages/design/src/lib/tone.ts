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
  success: "bg-status-healthy",
  warning: "bg-status-warning",
  danger: "bg-status-recovery",
  info: "bg-accent",
  neutral: "bg-muted",
};

/** Tone ink, for icons and numbers that carry a status. */
export const toneText: Record<Tone, string> = {
  success: "text-ok",
  warning: "text-status-warning",
  danger: "text-status-recovery",
  info: "text-link",
  neutral: "text-muted",
};

/** The soft fill: the tone at 15% behind its -foreground ink, with a 25% border. Badges, banners, step markers. */
export const toneSoft: Record<Tone, string> = {
  success: "bg-status-healthy/15 text-ok border-status-healthy/25",
  warning: "bg-status-warning/15 text-status-warning border-status-warning/25",
  danger: "bg-status-recovery/15 text-status-recovery border-status-recovery/25",
  info: "bg-accent/15 text-link border-accent/25",
  neutral: "bg-muted/15 text-muted border-muted/25",
};
