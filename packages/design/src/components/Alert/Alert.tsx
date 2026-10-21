import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.ts";
import { toneBg, type Tone } from "../../lib/tone.ts";

const alertVariants = cva("flex items-start gap-2.5 border wrap-anywhere", {
  variants: {
    tone: {
      success: "border-status-healthy/25 bg-status-healthy/12 text-ok",
      warning: "border-status-warning/25 bg-status-warning/12 text-status-warning",
      danger: "border-status-recovery/25 bg-status-recovery/12 text-status-recovery",
      info: "border-accent/25 bg-accent/12 text-link",
      neutral: "border-muted/25 bg-muted/12 text-muted",
    },
    variant: {
      /** A page-level message, as the installer's `.alert` and `.banner`. */
      banner: "rounded-base px-3.5 py-3 text-sm",
      /** Inside a form or card, as AuroraBoot's inline warnings. */
      inline: "rounded-base px-3 py-2 text-[13px]",
    },
  },
  defaultVariants: { tone: "warning", variant: "banner" },
});

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof alertVariants> {
  tone?: Tone;
  /** A short bold first line. */
  title?: React.ReactNode;
  /** An icon in place of the tone dot. */
  icon?: React.ReactNode;
  /** Something to do about it: a button or a link, shown after the text. */
  action?: React.ReactNode;
}

/**
 * A message about the state of the page: a warning before a destructive
 * step, a failure, a success. Danger alerts interrupt (`role="alert"`); the
 * other tones are announced politely (`role="status"`). Not for toasts.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, tone = "warning", variant, title, icon, action, children, ...props }, ref) => (
    <div
      ref={ref}
      role={tone === "danger" ? "alert" : "status"}
      data-tone={tone}
      className={cn(alertVariants({ tone, variant }), className)}
      {...props}
    >
      {icon ?? (
        <span aria-hidden="true" className={cn("mt-[7px] h-2 w-2 shrink-0 rounded-full", toneBg[tone])} />
      )}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  ),
);
Alert.displayName = "Alert";

export { alertVariants };
