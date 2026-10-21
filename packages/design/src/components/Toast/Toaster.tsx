import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn.ts";
import { toneBg } from "../../lib/tone.ts";
import { useToastListener, type ToastMessage, type ToastTone } from "./toast.ts";

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

/** Mounts once, near the app root, and shows what `toast()` sends. */
export function Toaster({ duration = 3000, className }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
          data-tone={t.tone}
          className="flex items-center gap-3 overflow-hidden rounded-base border bg-surface pr-2 text-sm font-medium text-ink animate-fade-up"
        >
          <span aria-hidden="true" className={cn("self-stretch w-1 shrink-0", toneBar[t.tone])} />
          <span className="flex-1 py-3">{t.message}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded-base p-1 text-muted transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
