import { useCallback, useEffect, useState } from "react";

import { TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { Copy } from "lucide-react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import { getAnchorNodeAndPos } from "../../lib/tiptap-utils";

export interface UseDuplicateNodeConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onDuplicated?: () => void;
}

const canDuplicateNode = (editor: Editor | null): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  return !!getAnchorNodeAndPos(editor);
};

export const duplicateNode = (editor: Editor | null): boolean => {
  if (!canDuplicateNode(editor)) {
    return false;
  }

  try {
    const nodeInfo = getAnchorNodeAndPos(editor);
    if (!nodeInfo) {
      return false;
    }

    const { pos, node } = nodeInfo;
    const { selection } = editor!.state;
    const cursorOffsetFromNode = selection.anchor - pos;

    const insertPos = pos + node.nodeSize;
    const clonedNode = node.type.create(node.attrs, node.content, node.marks);

    const tr = editor!.state.tr;
    tr.insert(insertPos, clonedNode);

    const newCursorPos = insertPos + cursorOffsetFromNode;
    tr.setSelection(TextSelection.create(tr.doc, newCursorPos));

    editor!.view.dispatch(tr);

    return true;
  } catch {
    return false;
  }
};

const shouldShowButton = ({
  editor,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean => {
  if (!editor?.isEditable) return false;

  if (hideWhenUnavailable) {
    return canDuplicateNode(editor);
  }

  return true;
};

export const useDuplicateNode = ({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onDuplicated,
}: UseDuplicateNodeConfig = {}) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);
  const canDuplicate = canDuplicateNode(editor);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleDuplicate = useCallback(() => {
    if (!editor) return false;

    const success = duplicateNode(editor);
    if (success) {
      onDuplicated?.();
    }
    return success;
  }, [editor, onDuplicated]);

  return {
    isVisible,
    canDuplicate,
    handleDuplicate,
    label: "Duplicate",
    shortcutKeys: "mod+shift+d",
    Icon: Copy,
  };
};
