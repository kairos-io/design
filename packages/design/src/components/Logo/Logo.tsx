import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { logos, type LogoData } from "./logos.generated.ts";

export type LogoVariant = "color" | "white" | "black";
export type LogoLayout = "horizontal" | "stacked";

/**
 * The SVG files as shipped in dist/assets, for hosts that would rather link
 * the artwork than inline it (a favicon, an <img>, a Go template).
 */
export const logoAssets = {
  icon: {
    color: "assets/logos/kairos-icon-color.svg",
    white: "assets/logos/kairos-icon-white.svg",
    black: "assets/logos/kairos-icon-black.svg",
  },
  horizontal: {
    color: "assets/logos/kairos-horizontal-color.svg",
    white: "assets/logos/kairos-horizontal-white.svg",
    black: "assets/logos/kairos-horizontal-black.svg",
  },
  stacked: {
    color: "assets/logos/kairos-stacked-color.svg",
    white: "assets/logos/kairos-stacked-white.svg",
    black: "assets/logos/kairos-stacked-black.svg",
  },
} as const;

interface LogoSvgProps extends Omit<React.SVGProps<SVGSVGElement>, "viewBox" | "height"> {
  /** Which rendition of the artwork: full colour, or white or black for a flat surface. */
  variant?: LogoVariant;
  /** Hide from assistive technology when text next to it already names Kairos. */
  decorative?: boolean;
  /** The accessible name. Defaults to "Kairos". */
  label?: string;
  /** Height in px. With no height and no sizing class the mark is 32px tall. */
  height?: number;
}

function LogoSvg({
  data,
  variant: _variant,
  decorative = false,
  label = "Kairos",
  height,
  className,
  style,
  ...props
}: LogoSvgProps & { data: LogoData }) {
  const sized = height !== undefined || /\b(h-|w-|size-)/.test(className ?? "");
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={data.viewBox}
      fill="none"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      className={cn(!sized && "h-8 w-auto", height !== undefined && "w-auto", className)}
      style={height !== undefined ? { height, ...style } : style}
      {...props}
    >
      {data.shapes.map((shape, i) =>
        shape.tag === "rect" ? <rect key={i} {...shape.attrs} /> : <path key={i} {...shape.attrs} />,
      )}
    </svg>
  );
}

export type KairosMarkProps = LogoSvgProps;

/** The Kairos icon: eighteen rhombi in the three brand oranges, from the CNCF artwork. */
export function KairosMark({ variant = "color", ...props }: KairosMarkProps) {
  return <LogoSvg data={logos[`icon-${variant}`]} variant={variant} {...props} />;
}

export interface KairosLogoProps extends LogoSvgProps {
  /** The wordmark beside the icon (horizontal) or under it (stacked). */
  layout?: LogoLayout;
}

/** The Kairos logo with the wordmark, from the CNCF artwork. */
export function KairosLogo({ layout = "horizontal", variant = "color", ...props }: KairosLogoProps) {
  return <LogoSvg data={logos[`${layout}-${variant}`]} variant={variant} {...props} />;
}
