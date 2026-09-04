import { forwardRef, type MouseEvent, useCallback } from "react";

import { Kbd } from "@/components/ui/kbd";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { parseShortcutKeys } from "@/editor/tiptap-cores/lib/tiptap-utils";
import type { TiptapButtonProps } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";

import { type UseMarkConfig, useMark } from "./use-mark";

interface MarkButtonProps
  extends Omit<TiptapButtonProps, "type">,
    UseMarkConfig {
  text?: string;
  showShortcut?: boolean;
}

export const MarkButton = forwardRef<HTMLButtonElement, MarkButtonProps>(
  (
    {
      editor: providedEditor,
      type,
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
      handleMark,
      label,
      canToggle,
      isActive,
      Icon,
      shortcutKeys,
    } = useMark({
      editor,
      type,
      hideWhenUnavailable,
      onToggled,
    });

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          handleMark();
        }
      },
      [handleMark, onClick],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <TiptapButton
        type="button"
        disabled={!canToggle}
        isToggled={isActive}
        tabIndex={-1}
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
            {showShortcut && (
              <Kbd>
                {parseShortcutKeys({
                  shortcutKeys,
                })}
              </Kbd>
            )}
          </>
        )}
      </TiptapButton>
    );
  },
);
