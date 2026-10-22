import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.ts";
import { TileLoader } from "../Tiles/TileLoader.tsx";
import { focusOutline } from "../../lib/focus.ts";

export const buttonVariants = cva(
  `relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-base leading-none transition-colors ${focusOutline} disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not(.tile-loader)]:size-4 [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        /** The one action that matters: the accent with dark ink on it. "Download ISO". */
        default:
          "bg-accent font-bold text-on-accent hover:bg-accent/85 disabled:bg-raised disabled:text-muted",
        /** The dark button: ink with the page colour on it. "Read the docs". */
        dark: "bg-ink font-semibold text-bg hover:bg-deep disabled:bg-raised disabled:text-muted",
        /** The same as dark; the name the first release used. */
        secondary: "bg-ink font-semibold text-bg hover:bg-deep disabled:bg-raised disabled:text-muted",
        /** A 1.5px ink hairline, no fill. "GitHub". */
        outline:
          "border-[1.5px] border-ink bg-transparent font-semibold text-ink hover:bg-hover disabled:border-line disabled:text-muted",
        /** No chrome until hovered: toolbars, table rows. */
        ghost: "font-semibold text-ink hover:bg-hover disabled:text-muted",
        /** An inline action in the link colour. "Learn more →". */
        link: "px-1.5 font-semibold text-link hover:text-accent disabled:text-muted",
        /** Loses data: the recovery red with white on it. "Reset node". */
        destructive:
          "bg-status-recovery font-semibold text-status-ink hover:bg-status-recovery/90 disabled:bg-raised disabled:text-muted",
        "destructive-outline":
          "border-[1.5px] border-status-recovery bg-transparent font-semibold text-status-recovery hover:bg-hover disabled:border-line disabled:text-muted",
        /** @deprecated The sidebar is no longer navy; use ghost. Kept for callers of the first release. */
        "on-navy": "font-semibold text-ink opacity-70 hover:bg-raised hover:opacity-100 disabled:text-muted",
      },
      size: {
        sm: "px-3 py-[7px] text-[13px]",
        default: "px-[18px] py-[11px] text-[15px]",
        lg: "px-[22px] py-[13px] text-[17px]",
        icon: "h-10 w-10 text-[15px]",
        "icon-sm": "h-8 w-8 text-[13px]",
      },
    },
    compoundVariants: [
      // The outline's 1.5px border is inside the same box as the filled buttons.
      { variant: ["outline", "destructive-outline"], size: "sm", className: "px-[10.5px] py-[5.5px]" },
      { variant: ["outline", "destructive-outline"], size: "default", className: "px-[16.5px] py-[9.5px]" },
      { variant: ["outline", "destructive-outline"], size: "lg", className: "px-[20.5px] py-[11.5px]" },
      { variant: "link", size: ["sm", "default", "lg"], className: "px-1.5" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/** The variants with a fill behind their ink, where the mono loader goes. */
const FILLED = { default: true, dark: true, secondary: true, destructive: true } as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render the child element (a link, say) with the button's classes instead of a <button>. */
  asChild?: boolean;
  /** Disables the button and shows the tile loader over its children, which keep their place so the width holds. */
  loading?: boolean;
}

/**
 * The button of the Foundations deck: the accent for the one action that
 * matters, the dark ink button and the outline for the rest, the link colour
 * for an inline action, the recovery red for anything that loses data. The
 * focus state is a 2px ink outline, offset 2px. Icon-only sizes need an
 * aria-label; a development build warns when one is missing.
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
    // The loader is a three-tone cube, so it cannot simply take currentColor:
    // on a filled button it is the mono rendition in the button's own ink,
    // on the outline, ghost and link buttons the brand palette. It is
    // decorative here, since the button is already busy. It sits over the
    // label, which goes transparent but keeps its place and its name, so a
    // button is exactly as wide loading as it is idle and nothing beside it
    // moves.
    const filled = variant == null || variant in FILLED;

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
        {loading && (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <TileLoader size={16} tone={filled ? "mono" : "palette"} decorative />
          </span>
        )}
        <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>{children}</span>
      </button>
    );
  },
);
Button.displayName = "Button";
