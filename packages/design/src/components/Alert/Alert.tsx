import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.ts";
import { toneBg, type Tone } from "../../lib/tone.ts";

const alertVariants = cva("flex items-start gap-2.5 border wrap-anywhere", {
  variants: {
    tone: {
      success: "border-success/25 bg-success/12 text-success-foreground",
      warning: "border-warning/25 bg-warning/12 text-warning-foreground",
      danger: "border-danger/25 bg-danger/12 text-danger-foreground",
      info: "border-info/25 bg-info/12 text-info-foreground",
      neutral: "border-neutral/25 bg-neutral/12 text-neutral-foreground",
    },
    variant: {
      /** A page-level message, as the installer's `.alert` and `.banner`. */
      banner: "rounded-lg px-3.5 py-3 text-sm",
      /** Inside a form or card, as AuroraBoot's inline warnings. */
      inline: "rounded-md px-3 py-2 text-[13px]",
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
