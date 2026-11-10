import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { logos, type LogoData } from "./logos.generated.ts";

/**
 * Which rendition of the artwork. `color` is the full-colour lockup for light
 * surfaces; `dark` keeps the colour mark and sets the wordmark in white, for
 * dark surfaces; `white` and `black` are one-colour renditions for flat
 * fills, photography and print.
 */
export type LogoVariant = "color" | "dark" | "white" | "black";
export type LogoLayout = "horizontal" | "stacked";

/** The renditions the Hadron mark ships in. The mark is the same on light and dark surfaces. */
export type HadronMarkVariant = "color" | "white";
/** The renditions the Hadron lockup ships in: by the surface it sits on. */
export type HadronLogoVariant = "color" | "dark";

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
    dark: "assets/logos/kairos-horizontal-dark.svg",
    white: "assets/logos/kairos-horizontal-white.svg",
    black: "assets/logos/kairos-horizontal-black.svg",
  },
  stacked: {
    color: "assets/logos/kairos-stacked-color.svg",
    white: "assets/logos/kairos-stacked-white.svg",
    black: "assets/logos/kairos-stacked-black.svg",
  },
} as const;

/** The Hadron files as shipped in dist/assets. */
export const hadronLogoAssets = {
  icon: {
    color: "assets/logos/hadron-icon-color.svg",
    white: "assets/logos/hadron-icon-white.svg",
  },
  horizontal: {
    color: "assets/logos/hadron-horizontal-color.svg",
    dark: "assets/logos/hadron-horizontal-dark.svg",
  },
} as const;

interface LogoSvgProps extends Omit<React.SVGProps<SVGSVGElement>, "viewBox" | "height"> {
  /** Hide from assistive technology when text next to it already names the brand. */
  decorative?: boolean;
  /** The accessible name. Defaults to the brand name. */
  label?: string;
  /** Height in px. With no height and no sizing class the mark is 32px tall. */
  height?: number;
}

function LogoSvg({
  data,
  decorative = false,
  label,
  height,
  className,
  style,
  ...props
}: LogoSvgProps & { data: LogoData; label: string }) {
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
      {data.shapes.map((shape, i) => React.createElement(shape.tag, { key: i, ...shape.attrs }))}
    </svg>
  );
}

export interface KairosMarkProps extends LogoSvgProps {
  /** `color` on any plain surface, `white` or `black` for one-colour uses. `dark` is the colour mark. */
  variant?: LogoVariant;
}

/** The Kairos icon: eighteen rhombi in the three brand oranges, from the CNCF artwork. */
export function KairosMark({ variant = "color", label = "Kairos", ...props }: KairosMarkProps) {
  const rendition = variant === "dark" ? "color" : variant;
  return <LogoSvg data={logos[`icon-${rendition}`]} label={label} {...props} />;
}

export interface KairosLogoProps extends LogoSvgProps {
  /** The wordmark beside the icon (horizontal) or under it (stacked). */
  layout?: LogoLayout;
  /** `color` on light surfaces, `dark` on dark surfaces (horizontal only), `white` or `black` for one-colour uses. */
  variant?: LogoVariant;
}

/**
 * The Kairos logo with the wordmark. The colour, white and black renditions
 * are the CNCF artwork; the dark-surface horizontal lockup (colour mark,
 * white wordmark) is the decks'. The stacked layout has no dark rendition and
 * falls back to white.
 */
export function KairosLogo({
  layout = "horizontal",
  variant = "color",
  label = "Kairos",
  ...props
}: KairosLogoProps) {
  const rendition = variant === "dark" && layout === "stacked" ? "white" : variant;
  return <LogoSvg data={logos[`${layout}-${rendition}`]} label={label} {...props} />;
}

export interface HadronMarkProps extends LogoSvgProps {
  /** `color` on any plain surface, light or dark; `white` for a flat fill or photography. */
  variant?: HadronMarkVariant;
}

/** The Hadron mark: the three blues, from the decks. The same on light and dark surfaces. */
export function HadronMark({ variant = "color", label = "Hadron", ...props }: HadronMarkProps) {
  return <LogoSvg data={logos[`hadron-icon-${variant}`]} label={label} {...props} />;
}

export interface HadronLogoProps extends LogoSvgProps {
  /** `color` on light surfaces (ink wordmark), `dark` on dark surfaces (white wordmark). The mark stays blue. */
  variant?: HadronLogoVariant;
}

/** The Hadron logo with the wordmark, from the decks. Horizontal only. */
export function HadronLogo({ variant = "color", label = "Hadron", ...props }: HadronLogoProps) {
  return <LogoSvg data={logos[`hadron-horizontal-${variant}`]} label={label} {...props} />;
}
