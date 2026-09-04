import { forwardRef, type MouseEvent, useCallback } from "react";

import type { Editor } from "@tiptap/react";
import { Plus } from "lucide-react";

import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import type { TiptapButtonProps } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";

import { insertSlashCommand } from "./slash-command-trigger-utils";

interface SlashCommandTriggerButtonProps
  extends Omit<TiptapButtonProps, "type"> {
  editor?: Editor | null;
  trigger?: string;
  onTriggered?: (trigger: string) => void;
  nodePos?: number;
}

export const SlashCommandTriggerButton = forwardRef<
  HTMLButtonElement,
  SlashCommandTriggerButtonProps
>(
  (
    {
      editor: providedEditor,
      trigger = "/",
      onTriggered,
      nodePos,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const canInsert = editor?.isEditable ?? false;

    const handleSlashCommand = useCallback(() => {
      if (!editor) {
        return false;
      }

      const success = insertSlashCommand(editor, trigger, nodePos);

      if (success) {
        onTriggered?.(trigger);
      }

      return success;
    }, [editor, trigger, onTriggered, nodePos]);

    const handleMouseDown = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      },
      [],
    );

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        handleSlashCommand();
      },
      [handleSlashCommand, onClick],
    );

    return (
      <TiptapButton
        type="button"
        role="button"
        tabIndex={-1}
        disabled={!canInsert}
        aria-label="Click to add below"
        tooltip="Click to add below"
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? <Plus className="size-4" />}
      </TiptapButton>
    );
  },
);
