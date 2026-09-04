import * as React from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  arrowClassName,
  contentClassName,
  showArrow = true,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  arrowClassName?: string;
  contentClassName?: string;
  showArrow?: boolean;
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-white animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50003 max-w-sm origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-2 text-sm",
          className,
        )}
        {...props}
      >
        <div className={cn("line-clamp-4", contentClassName)}>{children}</div>
        {showArrow && (
          <TooltipPrimitive.Arrow
            className={cn(
              "bg-foreground fill-foreground z-50003 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-xs",
              arrowClassName,
            )}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

// Simple tooltip wrapper for common use cases
// Maps placement values from floating-ui to Radix side values
type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

function mapPlacementToSide(
  placement: Placement,
): "top" | "right" | "bottom" | "left" {
  if (placement.startsWith("top")) return "top";
  if (placement.startsWith("right")) return "right";
  if (placement.startsWith("bottom")) return "bottom";
  if (placement.startsWith("left")) return "left";
  return "top";
}

interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  /** @deprecated Use `side` instead */
  placement?: Placement;
  delayDuration?: number;
  disabled?: boolean;
  /** Override the default `line-clamp-4` wrapper (needed for structured JSX content). */
  contentClassName?: string;
  /** @deprecated Portal is always used */
  usePortal?: boolean;
}

type SimpleTooltipForwardProps = SimpleTooltipProps &
  Omit<
    React.HTMLAttributes<HTMLButtonElement>,
    keyof SimpleTooltipProps | "content"
  >;

const SimpleTooltip = React.forwardRef<
  HTMLButtonElement,
  SimpleTooltipForwardProps
>(function SimpleTooltip(
  {
    content,
    children,
    side = "right",
    placement,
    delayDuration = 400,
    disabled = false,
    contentClassName,
    ...rest
  },
  ref,
) {
  if (disabled) {
    return (
      <>
        {React.isValidElement(children)
          ? React.cloneElement(children, { ref, ...rest } as React.Attributes)
          : children}
      </>
    );
  }

  const resolvedSide = placement ? mapPlacementToSide(placement) : side;

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipTrigger asChild ref={ref} {...rest}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={resolvedSide} contentClassName={contentClassName}>
          {content}
        </TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );
});

export {
  SimpleTooltip,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
};
