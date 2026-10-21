import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/cn.ts";

export const Tabs = TabsPrimitive.Root;

/** The tab strip of the Foundations deck: a row on a hairline, 20px apart. Give it an `aria-label`. */
export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("flex flex-wrap items-end gap-5 border-b border-line", className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/** 15px semibold; the active tab is ink with a 2px accent line under it, the rest are muted. */
export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent py-2 text-[15px] font-semibold leading-tight text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-accent-line data-[state=active]:text-ink",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
