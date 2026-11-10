import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.ts";

export const labelVariants = cva(
  "text-sm font-semibold leading-none text-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

export type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>;

/** The form label: 14px semibold, as the Foundations deck sets "Hostname" and "Target disk". Always set `htmlFor` to the control's id. */
export const Label = React.forwardRef<React.ComponentRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
  ),
);
Label.displayName = "Label";
