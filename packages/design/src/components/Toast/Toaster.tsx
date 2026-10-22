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

/** Mounts once, near the app root, and shows what `toast()` sends. */
export function Toaster({ duration = 3000, className }: ToasterProps) {
  const [toasts, setToasts] = useState<ShownToast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const nodes = useRef(new Map<string, HTMLDivElement>());
  // Where every toast sat before the last removal, for the slide that follows it.
  const before = useRef<Map<string, number> | null>(null);

  const remove = useCallback((id: string) => {
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

  const handleToast = useCallback(
    (t: ToastMessage) => {
      setToasts((prev) => [...prev, t]);
      timers.current.set(
        t.id,
        setTimeout(() => dismiss(t.id), duration),
      );
    },
    [dismiss, duration],
  );

  useToastListener(handleToast);

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

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Notifications"
      className={cn(
        "fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2",
        className,
      )}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          ref={(node) => {
            if (node) nodes.current.set(t.id, node);
            else nodes.current.delete(t.id);
          }}
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
