import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn.ts";
import { motionDuration } from "../../lib/motion.ts";
import { toneBg } from "../../lib/tone.ts";
import { useToastListener, type ToastMessage, type ToastTone } from "./toast.ts";
import { focusRing } from "../../lib/focus.ts";

export interface ToasterProps {
  /** How long a toast stays, in ms. */
  duration?: number;
  className?: string;
}

// The toast is a card in the page's own colours with a tone bar on the
// left, rather than AuroraBoot's solid green and red: the solid fills were
// palette colours outside the tokens, and the bar reads in both themes.
const toneBar: Record<ToastTone, string> = {
  success: toneBg.success,
  warning: toneBg.warning,
  danger: toneBg.danger,
  info: toneBg.info,
};

interface ShownToast extends ToastMessage {
  /** Fading out; removed once the fade has run. */
  exiting?: boolean;
}

/** What a toast has left to run, so a pause can give it back. */
interface Countdown {
  /** When the running stretch started, from `performance.now()`; null while paused. */
  from: number | null;
  /** How long was left when that stretch started. */
  left: number;
}

/** Mounts once, near the app root, and shows what `toast()` sends. */
export function Toaster({ duration = 3000, className }: ToasterProps) {
  const [toasts, setToasts] = useState<ShownToast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const nodes = useRef(new Map<string, HTMLDivElement>());
  // How much of its stay each toast has left. A null `from` means paused.
  const clocks = useRef(new Map<string, Countdown>());
  // Where every toast sat before the last removal, for the slide that follows it.
  const before = useRef<Map<string, number> | null>(null);

  const remove = useCallback((id: string) => {
    clocks.current.delete(id);
    before.current = new Map(
      Array.from(nodes.current, ([key, node]) => [key, node.getBoundingClientRect().top] as const),
    );
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // A dismissed toast fades out over the fast duration before it leaves the
  // stack; under reduced motion the token is zero and it leaves at once.
  const dismiss = useCallback(
    (id: string) => {
      const timer = timers.current.get(id);
      if (timer) clearTimeout(timer);
      timers.current.delete(id);
      clocks.current.delete(id);
      const ms = motionDuration("fast");
      if (ms <= 0) {
        remove(id);
        return;
      }
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id);
          remove(id);
        }, ms),
      );
    },
    [remove],
  );

  // Starts (or restarts) a toast's stay with `left` ms to run.
  const run = useCallback(
    (id: string, left: number) => {
      const timer = timers.current.get(id);
      if (timer) clearTimeout(timer);
      clocks.current.set(id, { from: performance.now(), left });
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), left),
      );
    },
    [dismiss],
  );

  const handleToast = useCallback(
    (t: ToastMessage) => {
      setToasts((prev) => [...prev, t]);
      run(t.id, duration);
    },
    [duration, run],
  );

  useToastListener(handleToast);

  // Pointer over a toast, or focus inside one, holds it open: a message that
  // is being read or whose button is being reached must not go on its own
  // (WCAG 2.2.1). It leaves with the time it had left once the pointer or the
  // focus goes. A toast already fading out keeps going; its clock is gone.
  const hold = useCallback((id: string) => {
    const clock = clocks.current.get(id);
    if (!clock || clock.from === null) return;
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    clocks.current.set(id, { from: null, left: Math.max(0, clock.left - (performance.now() - clock.from)) });
  }, []);

  const release = useCallback(
    (id: string) => {
      const clock = clocks.current.get(id);
      if (!clock || clock.from !== null) return;
      run(id, clock.left);
    },
    [run],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  // When a toast leaves, the ones that stay take their new place at once in
  // layout and slide there from where they were on a transform, over the
  // fast duration: the stack never teleports, and nothing but transform moves.
  useLayoutEffect(() => {
    const first = before.current;
    if (!first) return;
    before.current = null;
    nodes.current.forEach((node, id) => {
      const was = first.get(id);
      if (was === undefined) return;
      node.style.transition = "none";
      node.style.transform = "";
      const delta = was - node.getBoundingClientRect().top;
      if (Math.abs(delta) < 0.5) return;
      node.style.transform = `translateY(${delta}px)`;
      node.getBoundingClientRect(); // commit the start position before the transition begins
      node.style.transition = "transform var(--duration-fast) var(--ease-out)";
      node.style.transform = "";
    });
  });

  // The stack itself is a plain labelled region, and each toast is its own
  // live region in its own urgency: a danger toast interrupts (role="alert",
  // assertive), the rest are announced politely, where one polite region
  // around the stack read a failure as calmly as a success.
  return (
    <div
      role="region"
      aria-label="Notifications"
      className={cn(
        "fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2",
        className,
      )}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === "danger" ? "alert" : "status"}
          ref={(node) => {
            if (node) nodes.current.set(t.id, node);
            else nodes.current.delete(t.id);
          }}
          onPointerEnter={() => hold(t.id)}
          onPointerLeave={() => release(t.id)}
          onFocus={() => hold(t.id)}
          onBlur={() => release(t.id)}
        >
          <div
            data-tone={t.tone}
            data-exiting={t.exiting || undefined}
            className={cn(
              "flex items-center gap-3 overflow-hidden rounded-base border bg-surface pr-2 text-sm font-medium text-ink",
              t.exiting ? "pointer-events-none animate-fade-out" : "animate-fade-up",
            )}
          >
            <span aria-hidden="true" className={cn("self-stretch w-1 shrink-0", toneBar[t.tone])} />
            <span className="flex-1 py-3">{t.message}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className={`shrink-0 rounded-base p-1 text-muted transition-colors hover:bg-hover hover:text-ink ${focusRing}`}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
