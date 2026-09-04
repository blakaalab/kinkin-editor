import { forwardRef, type MouseEvent, useCallback } from "react";

import { Kbd } from "@/components/ui/kbd";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { parseShortcutKeys } from "@/editor/tiptap-cores/lib/tiptap-utils";
import type { TiptapButtonProps } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";

import {
  type UseHorizontalRuleConfig,
  useHorizontalRule,
} from "./use-horizontal-rule";

interface HorizontalRuleButtonProps
  extends Omit<TiptapButtonProps, "type">,
    UseHorizontalRuleConfig {
  text?: string;
  showShortcut?: boolean;
}

export const HorizontalRuleButton = forwardRef<
  HTMLButtonElement,
  HorizontalRuleButtonProps
>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onInserted,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canInsert, handleInsert, label, shortcutKeys, Icon } =
      useHorizontalRule({
        editor,
        hideWhenUnavailable,
        onInserted,
      });

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          handleInsert();
        }
      },
      [handleInsert, onClick],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <TiptapButton
        type="button"
        tabIndex={-1}
        disabled={!canInsert}
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
