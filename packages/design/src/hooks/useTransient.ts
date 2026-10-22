import { useEffect, useState } from "react";

/** How long a copy control says "Copied" before it reads "Copy" again. */
export const FEEDBACK_MS = 1500;

/**
 * State that falls back to its resting value by itself: the "Copied" flash on
 * a copy control. Setting any other value starts the timer; setting a new
 * non-resting value restarts it; setting the resting value clears it. The
 * timer is cleared on unmount.
 */
export function useTransient<T>(resting: T, ms: number = FEEDBACK_MS): [T, (value: T) => void] {
  const [value, setValue] = useState(resting);
  useEffect(() => {
    if (value === resting) return;
    const t = window.setTimeout(() => setValue(resting), ms);
    return () => window.clearTimeout(t);
  }, [value, resting, ms]);
  return [value, setValue];
}
