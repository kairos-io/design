import * as React from "react";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.ts";
import { cn } from "../../lib/cn.ts";
import type { ThemeMode } from "../../lib/theme.ts";

const options: { mode: ThemeMode; icon: LucideIcon; label: string }[] = [
  { mode: "system", icon: Monitor, label: "System theme" },
  { mode: "light", icon: Sun, label: "Light theme" },
  { mode: "dark", icon: Moon, label: "Dark theme" },
];

const nextMode: Record<ThemeMode, ThemeMode> = {
  system: "light",
  light: "dark",
  dark: "system",
};

export interface ThemeToggleProps extends React.HTMLAttributes<HTMLElement> {
  /** One button that cycles system, light, dark: for the icon rail and top bar. */
  compact?: boolean;
  /** The localStorage key the choice is kept under. */
  storageKey?: string;
}

/**
 * Switches between system, light and dark. The full control is a group with
 * one button per mode, styled for the navy sidebar; the compact one cycles.
 * The ref and the remaining attributes go to the group, or to the compact button.
 */
export const ThemeToggle = React.forwardRef<HTMLElement, ThemeToggleProps>(function ThemeToggle(
  { compact = false, storageKey, className, ...props },
  ref,
) {
  const { mode, setMode } = useTheme({ storageKey });

  if (compact) {
    const current = options.find((o) => o.mode === mode) ?? options[0];
    const Icon = current.icon;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        aria-label={`Theme: ${mode}`}
        title={`Theme: ${mode}`}
        onClick={() => setMode(nextMode[mode])}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-base text-ink opacity-70 transition-colors hover:bg-raised hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
          className,
        )}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      role="group"
      aria-label="Theme"
      className={cn("flex w-full gap-1 rounded-base bg-raised p-1", className)}
      {...props}
    >
      {options.map(({ mode: m, icon: Icon, label }) => (
        <button
          key={m}
          type="button"
          aria-label={label}
          aria-pressed={mode === m}
          title={label}
          onClick={() => setMode(m)}
          className={cn(
            "inline-flex h-7 flex-1 items-center justify-center rounded-base text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
            mode === m ? "bg-accent text-on-accent" : "opacity-70 hover:opacity-100",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
});
ThemeToggle.displayName = "ThemeToggle";
