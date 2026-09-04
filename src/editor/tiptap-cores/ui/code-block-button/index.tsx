import { forwardRef, type MouseEvent, useCallback } from "react";

import { Kbd } from "@/components/ui/kbd";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { parseShortcutKeys } from "@/editor/tiptap-cores/lib/tiptap-utils";
import type { TiptapButtonProps } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";

import { type UseCodeBlockConfig, useCodeBlock } from "./use-code-block";

interface CodeBlockButtonProps
  extends Omit<TiptapButtonProps, "type">,
    UseCodeBlockConfig {
  text?: string;
  showShortcut?: boolean;
}

export const CodeBlockButton = forwardRef<
  HTMLButtonElement,
  CodeBlockButtonProps
>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const {
      isVisible,
      canToggle,
      isActive,
      handleToggle,
      label,
      shortcutKeys,
      Icon,
    } = useCodeBlock({
      editor,
      hideWhenUnavailable,
      onToggled,
    });

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          handleToggle();
        }
      },
      [handleToggle, onClick],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <TiptapButton
        type="button"
        isToggled={isActive}
        tabIndex={-1}
        disabled={!canToggle}
        aria-label={label}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="size-4" />
            {text && <span>{text}</span>}
            {showShortcut && <Kbd>{parseShortcutKeys({ shortcutKeys })}</Kbd>}
          </>
        )}
      </TiptapButton>
    );
  },
);
