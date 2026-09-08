import { useCallback, useEffect, useState } from "react";

import type { Editor } from "@tiptap/react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";

export type TextAlignment = "left" | "center" | "right" | "justify";

export interface UseTextAlignConfig {
  editor?: Editor | null;
  alignment: TextAlignment;
  hideWhenUnavailable?: boolean;
  onAligned?: () => void;
}

const alignIcons = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
};

const alignLabels = {
  left: "Align left",
  center: "Align center",
  right: "Align right",
  justify: "Justify",
};

/** The shortcuts the TextAlign extension binds itself. */
const ALIGN_SHORTCUT_KEYS = {
  left: "mod+shift+l",
  center: "mod+shift+e",
  right: "mod+shift+r",
  justify: "mod+shift+j",
};

const canSetAlignment = (
  editor: Editor | null,
  alignment: TextAlignment,
): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  try {
    return editor.can().setTextAlign(alignment);
  } catch {
    return false;
  }
};

const isAlignmentActive = (
  editor: Editor | null,
  alignment: TextAlignment,
): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  return editor.isActive({ textAlign: alignment });
};

export const useTextAlign = ({
  editor: providedEditor,
  alignment,
  hideWhenUnavailable = false,
  onAligned,
}: UseTextAlignConfig) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);
  const canAlign = canSetAlignment(editor, alignment);
  const isActive = isAlignmentActive(editor, alignment);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        hideWhenUnavailable ? canSetAlignment(editor, alignment) : true,
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, alignment, hideWhenUnavailable]);

  const handleAlign = useCallback(() => {
    if (!editor || !canSetAlignment(editor, alignment)) {
      return false;
    }

    // Choosing the alignment a block already has clears it, so the block goes
    // back to inheriting rather than carrying a redundant attribute.
    const chain = editor.chain().focus();
    const success = isAlignmentActive(editor, alignment)
      ? chain.unsetTextAlign().run()
      : chain.setTextAlign(alignment).run();

    if (success) {
      onAligned?.();
    }

    return success;
  }, [editor, alignment, onAligned]);

  return {
    isVisible,
    isActive,
    canAlign,
    handleAlign,
    label: alignLabels[alignment],
    shortcutKeys: ALIGN_SHORTCUT_KEYS[alignment],
    Icon: alignIcons[alignment],
  };
};
