import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { phaseTone, type Tone } from "../../lib/tone.ts";

/**
 * The five node states the Foundations deck draws, each as a diamond:
 * healthy, upgrading and recovery are filled, installing and offline are
 * outlines. Upgrading and installing take the accent, offline the muted ink.
 */
export type NodeState = "healthy" | "upgrading" | "recovery" | "installing" | "offline";

export const nodeStates: Record<NodeState, { tone: Tone; outline: boolean; label: string }> = {
  healthy: { tone: "success", outline: false, label: "Healthy" },
  upgrading: { tone: "info", outline: false, label: "Upgrading" },
  recovery: { tone: "danger", outline: false, label: "Recovery" },
  installing: { tone: "info", outline: true, label: "Installing" },
  offline: { tone: "neutral", outline: true, label: "Offline" },
};

const stateWords: Record<string, NodeState> = {
  healthy: "healthy",
  online: "healthy",
  ready: "healthy",
  active: "healthy",
  completed: "healthy",
  upgrading: "upgrading",
  running: "upgrading",
  building: "upgrading",
  recovery: "recovery",
  failed: "recovery",
  error: "recovery",
  installing: "installing",
  pending: "installing",
  queued: "installing",
  offline: "offline",
  unknown: "offline",
};

/** Maps a node phase string onto one of the five drawn states; unknown phases read as offline. */
export function nodeStateOf(status: string | null | undefined): NodeState {
  return stateWords[(status ?? "").toLowerCase()] ?? "offline";
}

// Written out in full so Tailwind finds every class.
const toneFill: Record<Tone, string> = {
  success: "fill-status-healthy stroke-status-healthy",
  warning: "fill-status-warning stroke-status-warning",
  danger: "fill-status-recovery stroke-status-recovery",
  info: "fill-accent stroke-accent",
  neutral: "fill-muted stroke-muted",
};
const toneOutline: Record<Tone, string> = {
  success: "fill-none stroke-status-healthy",
  warning: "fill-none stroke-status-warning",
  danger: "fill-none stroke-status-recovery",
  info: "fill-none stroke-accent",
  neutral: "fill-none stroke-muted",
};

export interface StatusDiamondProps extends React.SVGAttributes<SVGSVGElement> {
  /** One of the five node states; sets the tone and whether the diamond is filled. */
  state?: NodeState;
  /** A tone on its own, for statuses that are not node states. */
  tone?: Tone;
  /** An outlined diamond: a state that has not happened yet. */
  outline?: boolean;
  /** Rendered size in px. */
  size?: number;
}

/** The status diamond: decorative, the text beside it carries the meaning. */
export const StatusDiamond = React.forwardRef<SVGSVGElement, StatusDiamondProps>(
  ({ state, tone, outline, size = 10, className, ...props }, ref) => {
    const resolvedTone = tone ?? (state ? nodeStates[state].tone : "neutral");
    const isOutline = outline ?? (state ? nodeStates[state].outline : false);
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 12 12"
        aria-hidden="true"
        focusable="false"
        className={cn("shrink-0", isOutline ? toneOutline[resolvedTone] : toneFill[resolvedTone], className)}
        {...props}
      >
        <polygon points="6,0.8 11.2,6 6,11.2 0.8,6" strokeWidth="1.5" />
      </svg>
    );
  },
);
StatusDiamond.displayName = "StatusDiamond";

export interface StatusLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The status text. Without `state` or `tone` the state is read from it. */
  status?: string | null;
  state?: NodeState;
  tone?: Tone;
  outline?: boolean;
  /** On a surface chip, as the Foundations deck's status row and the node detail title show it. */
  chip?: boolean;
  children?: React.ReactNode;
}

/**
 * A status as the decks draw it: a diamond beside ink text, never a tinted
 * pill. With `chip` it sits on a surface with 2px corners.
 */
export const StatusLabel = React.forwardRef<HTMLSpanElement, StatusLabelProps>(
  ({ status, state, tone, outline, chip = false, className, children, ...props }, ref) => {
    const resolvedState = state ?? (tone ? undefined : nodeStateOf(status));
    const resolvedTone = tone ?? (resolvedState ? undefined : phaseTone(status));
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 text-sm font-semibold text-ink",
          chip && "rounded-sm bg-surface px-2.5 py-1.5",
          className,
        )}
        {...props}
      >
        <StatusDiamond state={resolvedState} tone={resolvedTone} outline={outline} />
        {children ?? (status || "unknown")}
      </span>
    );
  },
);
StatusLabel.displayName = "StatusLabel";
