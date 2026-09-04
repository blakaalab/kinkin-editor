import { useCallback, useEffect, useState } from "react";

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { TextQuote } from "lucide-react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import {
  getAnchorNodeAndPos,
  isNodeInSchema,
  isNodeTypeSelected,
} from "../../lib/tiptap-utils";

export interface UseBlockquoteConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

const canToggleBlockquote = (editor: Editor | null): boolean => {
  if (
    !editor?.isEditable ||
    !isNodeInSchema("blockquote", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

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

const toggleBlockquote = (editor: Editor | null): boolean => {
  if (!canToggleBlockquote(editor)) {
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

    const toggle = editor!.isActive("blockquote")
      ? chain.lift("blockquote")
      : chain.wrapIn("blockquote");

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
  if (!editor?.isEditable || !isNodeInSchema("blockquote", editor)) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleBlockquote(editor);
  }

  return true;
};

export const useBlockquote = ({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onToggled,
}: UseBlockquoteConfig = {}) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);
  const canToggle = canToggleBlockquote(editor);
  const isActive = editor?.isActive("blockquote") ?? false;

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
    if (!editor) {
      return false;
    }

    const success = toggleBlockquote(editor);
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
    label: "Quote",
    shortcutKeys: "mod+shift+b",
    Icon: TextQuote,
  };
};
