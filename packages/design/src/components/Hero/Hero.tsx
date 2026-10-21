import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { TileField, type TileFieldProps } from "../Tiles/TileField.tsx";
import type { PaletteProp } from "../Tiles/shared.ts";

export interface HeroProps extends React.HTMLAttributes<HTMLElement>, PaletteProp {
  /** The mono line above the title: "Kairos · CNCF sandbox project". */
  eyebrow?: React.ReactNode;
  /** The headline. One or two lines; use <br /> for the break the deck sets. */
  title: React.ReactNode;
  /** The paragraph under the title, capped at 560px. */
  lede?: React.ReactNode;
  /** The tile field at the right edge: props for it, or false for none. */
  tiles?: Partial<TileFieldProps> | false;
  /** A hairline under the hero, as hadron-linux.io has. */
  bordered?: boolean;
}

/**
 * The homepage hero: eyebrow, display headline, lede and the actions as
 * children, with a tile field clinging to the right edge and fading towards
 * the copy. The field never sits behind text: the copy is capped at 760px
 * and the field starts at 48% of the width.
 */
export const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    { eyebrow, title, lede, tiles = {}, palette = "kairos", bordered = false, className, children, ...props },
    ref,
  ) => (
    <section
      ref={ref}
      className={cn("relative w-full overflow-hidden", bordered && "border-b border-line", className)}
      {...props}
    >
      {tiles !== false && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[min(52%,720px)] md:block"
        >
          <TileField
            fade={(u, v) => Math.max(0, 1.05 - Math.hypot(u - 1, v - 0.45) * 1.35)}
            seed={3}
            radius={40}
            width={720}
            height={620}
            palette={palette}
            preserveAspectRatio="xMaxYMid slice"
            {...tiles}
          />
        </div>
      )}
      <div className="relative mx-auto flex w-full max-w-(--page-max) flex-col gap-6 px-4 py-14 sm:px-8 md:py-[clamp(56px,9vw,120px)]">
        {eyebrow && <span className="font-mono text-xs text-muted">{eyebrow}</span>}
        <h1 className="m-0 max-w-[760px] text-[clamp(48px,7.4vw,96px)] leading-[0.96] font-semibold tracking-[-0.05em] text-balance">
          {title}
        </h1>
        {lede && (
          <p className="m-0 max-w-[560px] text-[clamp(17px,1.6vw,20px)] leading-relaxed text-sub text-pretty">
            {lede}
          </p>
        )}
        {children && <div className="flex max-w-[560px] flex-col gap-2.5">{children}</div>}
      </div>
    </section>
  ),
);
Hero.displayName = "Hero";
