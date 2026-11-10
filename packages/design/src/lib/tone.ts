import type { Tone } from "../tokens/index.ts";

export type { Tone };

/**
 * How a status is drawn: its tone, and whether the diamond is filled or an
 * outline. The Foundations deck shows five node states: Healthy (filled
 * green), Upgrading (filled accent), Recovery (filled red), Installing
 * (accent outline) and Offline (muted outline).
 */
export interface StatusLook {
  tone: Tone;
  outline: boolean;
}

// Phase strings come from the Kairos stores in mixed case ("Healthy",
// "Upgrading") and from older code paths in lower case, so every comparison
// lowercases first. The table follows the deck: a state in progress is the
// accent, filled when the node is already running and outlined while it is
// still being installed; a node that has gone quiet is a muted outline, not
// an alarm; failure and recovery are red.
const phaseLooks: Record<string, StatusLook> = {
  healthy: { tone: "success", outline: false },
  online: { tone: "success", outline: false },
  ready: { tone: "success", outline: false },
  completed: { tone: "success", outline: false },
  active: { tone: "success", outline: false },
  succeeded: { tone: "success", outline: false },
  pending: { tone: "warning", outline: false },
  queued: { tone: "warning", outline: false },
  delivered: { tone: "warning", outline: false },
  degraded: { tone: "warning", outline: false },
  recovery: { tone: "danger", outline: false },
  failed: { tone: "danger", outline: false },
  error: { tone: "danger", outline: false },
  upgrading: { tone: "info", outline: false },
  running: { tone: "info", outline: false },
  building: { tone: "info", outline: false },
  installing: { tone: "info", outline: true },
  provisioning: { tone: "info", outline: true },
  offline: { tone: "neutral", outline: true },
  unknown: { tone: "neutral", outline: true },
};

/** Maps a node, build or deployment phase to how it is drawn; unknown phases are a neutral outline. */
export function phaseLook(phase: string | null | undefined): StatusLook {
  return phaseLooks[(phase ?? "").trim().toLowerCase()] ?? { tone: "neutral", outline: true };
}

/** Maps a node, build or deployment phase to its status tone; unknown phases are neutral. */
export function phaseTone(phase: string | null | undefined): Tone {
  return phaseLook(phase).tone;
}

// Written out in full so Tailwind finds every class in the source.

/** Solid tone background, for bars, meters and the tile bar. */
export const toneBg: Record<Tone, string> = {
  success: "bg-status-healthy",
  warning: "bg-status-warning",
  danger: "bg-status-recovery",
  info: "bg-accent",
  neutral: "bg-muted",
};

/** The diamond's fill and stroke, for inline SVG. */
export const toneFill: Record<Tone, string> = {
  success: "fill-status-healthy stroke-status-healthy",
  warning: "fill-status-warning stroke-status-warning",
  danger: "fill-status-recovery stroke-status-recovery",
  info: "fill-accent stroke-accent",
  neutral: "fill-muted stroke-muted",
};

/** The outlined diamond: no fill, the tone as stroke. */
export const toneStroke: Record<Tone, string> = {
  success: "fill-none stroke-status-healthy",
  warning: "fill-none stroke-status-warning",
  danger: "fill-none stroke-status-recovery",
  info: "fill-none stroke-accent",
  neutral: "fill-none stroke-muted",
};

/**
 * Tone ink, for the few icons and numbers that carry a status themselves.
 * The warning amber does not pass as small text on a light surface: use it
 * for a diamond or an icon beside ink text, never for a sentence.
 */
export const toneText: Record<Tone, string> = {
  success: "text-ok",
  warning: "text-status-warning",
  danger: "text-status-recovery",
  info: "text-link",
  neutral: "text-muted",
};

/**
 * The status chip: a surface with ink text, the same for every tone, because
 * the decks carry the tone in the diamond and never tint the chip.
 * @deprecated Use StatusBadge, which draws the diamond. Kept so the class map
 * still exists for pages that composed their own chips.
 */
export const toneSoft: Record<Tone, string> = {
  success: "bg-surface text-ink border-line",
  warning: "bg-surface text-ink border-line",
  danger: "bg-surface text-ink border-line",
  info: "bg-surface text-ink border-line",
  neutral: "bg-surface text-ink border-line",
};
