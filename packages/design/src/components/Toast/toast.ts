import { useEffect } from "react";
import type { Tone } from "../../lib/tone.ts";

export type ToastTone = Extract<Tone, "success" | "danger" | "info" | "warning">;

export interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
}

/** @deprecated Use ToastMessage; the name collided with the toast() function. */
export type Toast = ToastMessage;

const listeners = new Set<(toast: ToastMessage) => void>();
let counter = 0;

/**
 * Shows a toast on every mounted Toaster. The message is a short, finished
 * sentence ("ISO queued", "Could not reach the node"); anything the user has
 * to act on belongs in an Alert on the page instead.
 */
export function toast(message: string, tone: ToastTone = "info"): ToastMessage {
  const t: ToastMessage = { id: `${Date.now()}-${counter++}`, message, tone };
  listeners.forEach((fn) => fn(t));
  return t;
}

/** Subscribes to toast() calls. Toaster uses it; apps mount a Toaster instead. */
export function useToastListener(callback: (toast: ToastMessage) => void): void {
  useEffect(() => {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  }, [callback]);
}
