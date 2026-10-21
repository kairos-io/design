import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { StatusDot } from "../StatusDot/StatusDot.tsx";

export interface ChoiceCardProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "title" | "onSelect"
> {
  title: React.ReactNode;
  description?: React.ReactNode;
  selected?: boolean;
  /** A checkbox in a group where several can be picked; a radio otherwise. */
  multiple?: boolean;
  /** Shows a diamond before the title, filled with the accent when selected. */
  diamond?: boolean;
  /** Something at the end of the title row: a tile, a version, a badge. */
  meta?: React.ReactNode;
  onSelect?: () => void;
}

/**
 * A selectable card: the image source, architecture, model, variant and
 * output cards of the build wizard. The selected card takes the ink border
 * and the hover tint; a diamond, when asked for, fills with the accent.
 */
export const ChoiceCard = React.forwardRef<HTMLButtonElement, ChoiceCardProps>(
  (
    {
      title,
      description,
      selected = false,
      multiple = false,
      diamond = false,
      meta,
      onSelect,
      className,
      onClick,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={(e) => {
        onClick?.(e);
        onSelect?.();
      }}
      className={cn(
        "flex w-full cursor-pointer flex-col gap-1 rounded-base border-[1.5px] p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
        selected ? "border-ink bg-hover" : "border-line bg-transparent hover:bg-hover",
        className,
      )}
      {...props}
    >
      <span className="flex items-center justify-between gap-2 text-base font-bold text-ink">
        <span className="flex min-w-0 items-center gap-2">
          {diamond && <StatusDot size={11} tone="info" outline={!selected} className="stroke-ink" />}
          <span className="min-w-0">{title}</span>
        </span>
        {meta}
      </span>
      {description && <span className="text-sm text-sub">{description}</span>}
    </button>
  ),
);
ChoiceCard.displayName = "ChoiceCard";

export interface ChoiceGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Required: the group's name ("Architecture"). */
  "aria-label": string;
  /** A group of checkboxes rather than radios. */
  multiple?: boolean;
}

/** The grid that holds ChoiceCards and names the group. */
export const ChoiceGroup = React.forwardRef<HTMLDivElement, ChoiceGroupProps>(
  ({ multiple = false, className, ...props }, ref) => (
    <div
      ref={ref}
      role={multiple ? "group" : "radiogroup"}
      className={cn("grid gap-2 sm:grid-cols-2", className)}
      {...props}
    />
  ),
);
ChoiceGroup.displayName = "ChoiceGroup";
