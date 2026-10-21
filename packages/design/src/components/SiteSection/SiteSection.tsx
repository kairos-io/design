import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.ts";

const sectionVariants = cva("w-full", {
  variants: {
    tone: {
      /** The page canvas. */
      canvas: "",
      /** A hairline above and below, for a strip between sections. */
      lined: "border-y border-line",
      /** The raised band: the adopters strip on kairos.io. */
      raised: "bg-raised",
      /** The deep band: the dark section inside a light page. Its content is themed dark. */
      deep: "bg-deep",
    },
  },
  defaultVariants: { tone: "canvas" },
});

const paddings = {
  none: "",
  sm: "py-5",
  base: "py-16 md:py-20 lg:py-24",
  lg: "py-16 md:py-24 lg:py-28",
} as const;

export interface SiteSectionProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {
  /** Vertical padding inside the measure. */
  padding?: keyof typeof paddings;
  /** Render as a different element, for a <header> or <footer>. */
  as?: "section" | "div" | "header" | "footer" | "nav";
  /** Class for the inner measure (max-width --page-max, 32px gutters). */
  innerClassName?: string;
}

/**
 * A full-width band of a site page with the content capped at the page
 * measure (`--page-max`, 1280px) and 32px gutters, 16px on phones. The deep
 * tone nests `data-theme="dark"`, so the components inside it take their
 * dark values whatever the page theme is.
 */
export const SiteSection = React.forwardRef<HTMLElement, SiteSectionProps>(
  ({ tone, padding = "base", as: Tag = "section", className, innerClassName, children, ...props }, ref) => {
    const inner = (
      <div className={cn("mx-auto w-full max-w-(--page-max) px-4 sm:px-8", paddings[padding], innerClassName)}>
        {children}
      </div>
    );
    return (
      <Tag ref={ref as React.Ref<HTMLDivElement>} className={cn(sectionVariants({ tone }), className)} {...props}>
        {tone === "deep" ? (
          <div data-theme="dark" className="text-ink">
            {inner}
          </div>
        ) : (
          inner
        )}
      </Tag>
    );
  },
);
SiteSection.displayName = "SiteSection";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A mono line above the title: a kicker such as "Start here". */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** One paragraph under the title. */
  lede?: React.ReactNode;
  /** A link or action aligned to the end of the heading row. */
  action?: React.ReactNode;
  /** h2 by default; h3 inside a card. */
  level?: 2 | 3;
}

/** A section title with an optional eyebrow, lede and end-aligned action, as the site pages set them. */
export const SectionHeading = React.forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ eyebrow, title, lede, action, level = 2, className, ...props }, ref) => {
    const Heading: "h2" | "h3" = level === 2 ? "h2" : "h3";
    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap items-end justify-between gap-6", className)}
        {...props}
      >
        <div className="flex max-w-[640px] flex-col gap-3">
          {eyebrow && <span className="font-mono text-xs text-accent-soft">{eyebrow}</span>}
          <Heading
            className={cn(
              "m-0 font-semibold tracking-[-0.035em] text-balance",
              level === 2 ? "text-[clamp(34px,4vw,48px)] leading-[1.05]" : "text-h3 leading-tight",
            )}
          >
            {title}
          </Heading>
          {lede && <p className="m-0 text-lg leading-relaxed text-sub text-pretty">{lede}</p>}
        </div>
        {action}
      </div>
    );
  },
);
SectionHeading.displayName = "SectionHeading";
