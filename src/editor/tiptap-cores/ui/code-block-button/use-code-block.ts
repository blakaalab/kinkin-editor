import { useCallback, useEffect, useState } from "react";

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { CodeXml } from "lucide-react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import {
  getAnchorNodeAndPos,
  isNodeInSchema,
  isNodeTypeSelected,
} from "../../lib/tiptap-utils";

export interface UseCodeBlockConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

const canToggleCodeBlock = (editor: Editor | null): boolean => {
  if (
    !editor?.isEditable ||
    !isNodeInSchema("codeBlock", editor) ||
    isNodeTypeSelected(editor, ["image"])
  ) {
    return false;
  }

  try {
    const { selection } = editor.state;

    if (selection.empty || selection instanceof TextSelection) {
      if (!getAnchorNodeAndPos(editor)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

const toggleCodeBlock = (editor: Editor | null): boolean => {
  if (!canToggleCodeBlock(editor)) {
    return false;
  }

  try {
    const { view } = editor!;
    let { state } = view;

    if (state.selection.empty || state.selection instanceof TextSelection) {
      const anchorData = getAnchorNodeAndPos(editor);
      if (!anchorData) {
        return false;
      }

      const tr = state.tr.setSelection(
        NodeSelection.create(state.doc, anchorData.pos),
      );
      view.dispatch(tr);
      state = view.state;
    }

    const { selection } = state;

    let chain = editor!.chain().focus();

    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild;
      const lastChild = selection.node.lastChild?.lastChild;

      const from = firstChild
        ? selection.from + firstChild.nodeSize
        : selection.from + 1;

      const to = lastChild
        ? selection.to - lastChild.nodeSize
        : selection.to - 1;

      chain = chain.setTextSelection({ from, to }).clearNodes();
    }

    const toggle = editor!.isActive("codeBlock")
      ? chain.setNode("paragraph")
      : chain.toggleNode("codeBlock", "paragraph");

    toggle.run();

    editor!.chain().focus().selectTextblockEnd().run();

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
  if (!editor?.isEditable || !isNodeInSchema("codeBlock", editor)) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleCodeBlock(editor);
  }

  return true;
};

export const useCodeBlock = ({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onToggled,
}: UseCodeBlockConfig = {}) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);
  const canToggle = canToggleCodeBlock(editor);
  const isActive = editor?.isActive("codeBlock") ?? false;

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

  const handleToggle = useCallback(() => {
    if (!editor) return false;

    const success = toggleCodeBlock(editor);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: "Code",
    shortcutKeys: "mod+alt+c",
    Icon: CodeXml,
  };
};
