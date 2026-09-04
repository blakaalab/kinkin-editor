import { forwardRef, type MouseEvent, useCallback } from "react";

import { Sparkles } from "lucide-react";

import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { cn } from "@/editor/tiptap-cores/lib/tiptap-utils";
import type { TiptapButtonProps } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";

interface AiAssistButtonProps extends Omit<TiptapButtonProps, "type"> {
  text?: string;
}

export const AiAssistButton = forwardRef<
  HTMLButtonElement,
  AiAssistButtonProps
>(
  (
    {
      text = "Ask AI",
      onClick,
      className,
      children,
      showTooltip = false,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor();

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          editor?.commands.openAiAssistMenu();
        }
      },
      [onClick, editor],
    );

    return (
      <TiptapButton
        type="button"
        tabIndex={-1}
        aria-label="AI Assist"
        tooltip="AI Assist"
        onClick={handleClick}
        className={cn("text-blue-500", className)}
        showTooltip={showTooltip}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Sparkles className="size-4" />
            {text && <span className="whitespace-nowrap">{text}</span>}
          </>
        )}
      </TiptapButton>
    );
  },
);
