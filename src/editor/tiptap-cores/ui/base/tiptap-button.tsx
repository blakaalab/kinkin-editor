import {
  type ButtonHTMLAttributes,
  Fragment,
  forwardRef,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseShortcutKeys } from "@/editor/tiptap-cores/lib/tiptap-utils";
import { cn } from "@/lib/utils";

export interface TiptapButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  showTooltip?: boolean;
  tooltip?: ReactNode;
  shortcutKeys?: string;
  isToggled?: boolean;
  isFocused?: boolean;
}

export const TiptapButton = forwardRef<HTMLButtonElement, TiptapButtonProps>(
  (
    {
      className,
      children,
      tooltip,
      showTooltip = true,
      shortcutKeys,
      isToggled,
      isFocused,
      "aria-label": ariaLabel,
      onMouseDown,
      onPointerDown,
      ...props
    },
    ref,
  ) => {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const tooltipDisabledRef = useRef(false);

    useEffect(() => {
      if (!showTooltip) {
        setTooltipOpen(false);
        tooltipDisabledRef.current = true;
      } else if (tooltipDisabledRef.current) {
        const timer = setTimeout(() => {
          tooltipDisabledRef.current = false;
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [showTooltip]);

    const handleOpenChange = useCallback((open: boolean) => {
      if (tooltipDisabledRef.current && open) return;
      setTooltipOpen(open);
    }, []);

    const shortcuts = useMemo(
      () => parseShortcutKeys({ shortcutKeys }),
      [shortcutKeys],
    );

    const handleMouseDown = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        setTooltipOpen(false);
        onMouseDown?.(e);
      },
      [onMouseDown],
    );

    const handlePointerDown = useCallback(
      (e: PointerEvent<HTMLButtonElement>) => {
        setTooltipOpen(false);
        onPointerDown?.(e);
      },
      [onPointerDown],
    );

    const buttonClassName = cn(
      "flex items-center gap-1.5 cursor-pointer",
      "h-8 min-w-8 px-2 rounded-lg text-sm font-medium",
      "bg-transparent text-gray-600 hover:bg-gray-200",
      "transition-colors",
      "focus-visible:outline-none",
      "disabled:pointer-events-none disabled:opacity-50",
      isToggled && "bg-blue-200! text-gray-900! text-blue-700!",
      isFocused && !isToggled && "bg-gray-200",
      // Ariakit's keyboard navigation: highlight active item unless toggled
      !isToggled && "data-[active-item]:bg-gray-200",
      !isToggled &&
        !isFocused &&
        "group-data-[keyboard-active]/keyboard:hover:bg-transparent",
      className,
    );

    if (!tooltip || !showTooltip) {
      return (
        <button
          className={buttonClassName}
          ref={ref}
          aria-label={ariaLabel}
          onMouseDown={onMouseDown}
          onPointerDown={onPointerDown}
          {...props}
        >
          {children}
        </button>
      );
    }

    return (
      <Tooltip
        delayDuration={250}
        open={tooltipOpen}
        onOpenChange={handleOpenChange}
      >
        <TooltipTrigger asChild>
          <button
            className={buttonClassName}
            ref={ref}
            aria-label={ariaLabel}
            onMouseDown={handleMouseDown}
            onPointerDown={handlePointerDown}
            {...props}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
          {shortcuts.length > 0 && (
            <KbdGroup>
              {shortcuts.map((key, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: shortcut key parts are a fixed, never-reordered list
                <Fragment key={index}>
                  {index > 0 && <Kbd>+</Kbd>}
                  <Kbd>{key}</Kbd>
                </Fragment>
              ))}
            </KbdGroup>
          )}
        </TooltipContent>
      </Tooltip>
    );
  },
);
