import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn.ts";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-danger text-destructive-foreground shadow-sm hover:bg-danger/90",
        "destructive-outline": "border border-input bg-background text-danger-foreground hover:bg-danger/10",
        link: "text-primary underline-offset-4 hover:underline",
        /** For the navy sidebar and top bar: sidebar ink, brighter on hover. */
        "on-navy":
          "text-sidebar-fg opacity-70 hover:bg-sidebar-muted hover:text-sidebar-fg hover:opacity-100",
      },
      size: {
        sm: "h-7 rounded-md px-3 text-xs",
        default: "h-8 px-3 py-1.5",
        lg: "h-10 rounded-md px-6",
        icon: "h-8 w-8",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render the child element (a link, say) with the button's classes instead of a <button>. */
  asChild?: boolean;
  /** Disables the button and shows a spinner before its children. */
  loading?: boolean;
}

/**
 * The Kairos button, as AuroraBoot's ui/button.tsx defines it. Icon-only
 * sizes need an aria-label; a development build warns when one is missing.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const iconOnly = size === "icon" || size === "icon-sm";
    const unlabeled = iconOnly && !props["aria-label"] && !props["aria-labelledby"] && !props.title;

    // Effects do not run on the server, and a missing label is a defect in
    // any build, so the warning is not gated on an environment variable.
    React.useEffect(() => {
      if (unlabeled) {
        console.warn("Button: an icon-only button needs an aria-label");
      }
    }, [unlabeled]);

    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return (
        <Slot className={classes} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={classes}
        ref={ref}
        type={props.type ?? "button"}
        {...props}
        disabled={props.disabled || loading}
        aria-busy={loading ? true : props["aria-busy"]}
      >
        {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
