import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.ts";
import { StatusDot } from "../StatusDot/StatusDot.tsx";
import type { Tone } from "../../lib/tone.ts";

const alertVariants = cva(
  "grid grid-cols-[18px_1fr] gap-x-2.5 rounded-base bg-surface text-ink wrap-anywhere",
  {
    variants: {
      variant: {
        /** The callout of the Foundations deck: a page-level message. */
        banner: "px-4 py-3.5 text-[15px] leading-normal",
        /** Inside a form or card: smaller type and padding. */
        inline: "px-3 py-2.5 text-[13px] leading-snug",
      },
    },
    defaultVariants: { variant: "banner" },
  },
);

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof alertVariants> {
  /** The tone of the diamond. The chip itself is never tinted. */
  tone?: Tone;
  /** A short bold lead, set in the same line as the text: "Ready to automate?". */
  title?: React.ReactNode;
  /** An icon in place of the tone diamond. */
  icon?: React.ReactNode;
  /** Something to do about it: a link-style button or a link, shown after the text. */
  action?: React.ReactNode;
}

/**
 * A message about the state of the page, as the Foundations deck draws its
 * callout: a surface with a diamond in the tone, a bold lead running into
 * the text, and a link-coloured action. Danger alerts interrupt
 * (`role="alert"`); the other tones are announced politely
 * (`role="status"`). Not for toasts.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, tone = "info", variant, title, icon, action, children, ...props }, ref) => (
    <div
      ref={ref}
      role={tone === "danger" ? "alert" : "status"}
      data-tone={tone}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon ?? (
        <span className={cn("flex justify-center", variant === "inline" ? "pt-[3px]" : "pt-1")}>
          <StatusDot tone={tone} size={variant === "inline" ? 12 : 14} />
        </span>
      )}
      <div className="min-w-0">
        {title && <b className="font-bold">{title}</b>}
        {title && children && " "}
        {children}
        {action && <span className="ml-2 inline-flex font-semibold text-link [&_a]:text-link">{action}</span>}
      </div>
    </div>
  ),
);
Alert.displayName = "Alert";

export { alertVariants };
