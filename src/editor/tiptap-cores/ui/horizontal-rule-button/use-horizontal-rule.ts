import { useCallback, useEffect, useState } from "react";

import type { Editor } from "@tiptap/react";
import { Minus } from "lucide-react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import { isNodeInSchema } from "../../lib/tiptap-utils";

export interface UseHorizontalRuleConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onInserted?: () => void;
}

const canInsertHorizontalRule = (editor: Editor | null): boolean => {
  if (!editor?.isEditable || !isNodeInSchema("horizontalRule", editor)) {
    return false;
  }

  return editor.can().setHorizontalRule();
};

const shouldShowButton = ({
  editor,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean => {
  if (!editor?.isEditable || !isNodeInSchema("horizontalRule", editor)) {
    return false;
  }

  if (hideWhenUnavailable) {
    return canInsertHorizontalRule(editor);
  }

  return true;
};

export const useHorizontalRule = ({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onInserted,
}: UseHorizontalRuleConfig = {}) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);
  const canInsert = canInsertHorizontalRule(editor);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleInsert = useCallback(() => {
    if (!editor || !canInsertHorizontalRule(editor)) {
      return false;
    }

    editor.chain().focus().setHorizontalRule().run();
    onInserted?.();

    return true;
  }, [editor, onInserted]);

  return {
    isVisible,
    canInsert,
    handleInsert,
    label: "Horizontal line",
    shortcutKeys: "mod+alt+-",
    Icon: Minus,
  };
};
