import {
  type ComponentProps,
  forwardRef,
  type HTMLAttributes,
  useRef,
} from "react";

import { Separator } from "@/components/ui/separator";
import { useComposedRef } from "@/editor/tiptap-cores/hooks/use-composed-ref";
import { useToolbarNavigation } from "@/editor/tiptap-cores/hooks/use-toolbar-navigation";
import { cn } from "@/lib/utils";

interface TiptapToolbarProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "floating" | "fixed";
}

export const TiptapToolbar = forwardRef<HTMLDivElement, TiptapToolbarProps>(
  ({ children, className, variant = "fixed", ...props }, ref) => {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRef(toolbarRef, ref);
    useToolbarNavigation(toolbarRef);

    return (
      <div
        ref={composedRef}
        role="toolbar"
        aria-label="toolbar"
        data-variant={variant}
        className={cn(
          "flex items-center gap-1",
          "[&>[data-toolbar-group]:empty+[data-toolbar-separator]]:hidden",
          "[&>[data-toolbar-separator]:has(+[data-toolbar-group]:empty)]:hidden",
          variant === "fixed" &&
            "fixed bottom-0 z-10 w-full min-h-11 bg-white border-t border-gray-200 px-2 overflow-x-auto overscroll-x-contain flex-nowrap justify-start",
          variant === "floating" &&
            "p-0.5 rounded-lg border border-gray-200 bg-white shadow-xl outline-none overflow-hidden",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const TiptapToolbarGroup = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    data-toolbar-group
    className={cn("flex items-center gap-0.5 empty:hidden", className)}
    {...props}
  >
    {children}
  </div>
));

export const TiptapToolbarSeparator = ({
  className,
  ...props
}: ComponentProps<typeof Separator>) => (
  <Separator
    orientation="vertical"
    decorative
    data-toolbar-separator
    className={cn("h-6!", className)}
    {...props}
  />
);
