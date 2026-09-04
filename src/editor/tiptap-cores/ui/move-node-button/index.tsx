import { forwardRef, type MouseEvent, useCallback } from "react";

import { Kbd } from "@/components/ui/kbd";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { parseShortcutKeys } from "@/editor/tiptap-cores/lib/tiptap-utils";
import type { TiptapButtonProps } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";

import { type UseMoveNodeConfig, useMoveNode } from "./use-move-node";

interface MoveNodeButtonProps
  extends Omit<TiptapButtonProps, "type">,
    UseMoveNodeConfig {
  text?: string;
  showShortcut?: boolean;
}

export const MoveNodeButton = forwardRef<
  HTMLButtonElement,
  MoveNodeButtonProps
>(
  (
    {
      editor: providedEditor,
      text,
      direction,
      hideWhenUnavailable = false,
      onMoved,
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
      handleMoveNode,
      canMoveNode,
      label,
      shortcutKeys,
      Icon,
    } = useMoveNode({
      editor,
      direction,
      hideWhenUnavailable,
      onMoved,
    });

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          handleMoveNode();
        }
      },
      [handleMoveNode, onClick],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <TiptapButton
        type="button"
        tabIndex={-1}
        disabled={!canMoveNode}
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
