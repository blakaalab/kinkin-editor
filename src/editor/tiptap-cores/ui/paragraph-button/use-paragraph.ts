import { useCallback, useEffect, useState } from "react";

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { CaseSensitive } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

import { useIsMobile } from "../../hooks/use-mobile";
import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
} from "../../lib/tiptap-utils";

export interface UseParagraphConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

const SHORTCUT_KEY = "mod+alt+0";

const canToggleParagraph = (editor: Editor | null): boolean => {
  if (
    !editor ||
    !isNodeInSchema("paragraph", editor) ||
    isNodeTypeSelected(editor, ["image"])
  ) {
    return false;
  }

  try {
    const { selection } = editor.state;

    if (selection.empty || selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: selection.$anchor.node(1),
      })?.pos;

      if (!isValidPosition(pos)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

const toggleParagraph = (editor: Editor | null): boolean => {
  if (!editor?.isEditable || !canToggleParagraph(editor)) {
    return false;
  }

  try {
    const { view } = editor;
    let { state } = view;

    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;

      if (!isValidPosition(pos)) {
        return false;
      }

      const tr = state.tr.setSelection(NodeSelection.create(state.doc, pos));
      view.dispatch(tr);
      state = view.state;
    }

    const { selection } = state;
    let chain = editor.chain().focus();

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

    if (!editor.isActive("paragraph")) {
      chain.setNode("paragraph").run();
    }

    editor.chain().focus().selectTextblockEnd().run();

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
  if (!editor?.isEditable || !isNodeInSchema("paragraph", editor)) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleParagraph(editor);
  }

  return true;
};

export const useParagraph = ({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onToggled,
}: UseParagraphConfig = {}) => {
  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);
  const canToggle = canToggleParagraph(editor);
  const isActive = editor?.isActive("paragraph") ?? false;

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

  const handleToggle = useCallback(() => {
    if (!editor) {
      return false;
    }

    const success = toggleParagraph(editor);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, onToggled]);

  useHotkeys(
    SHORTCUT_KEY,
    (event) => {
      event.preventDefault();
      handleToggle();
    },
    {
      enabled: isVisible && canToggle,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    },
  );

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: "Paragraph",
    shortcutKeys: SHORTCUT_KEY,
    Icon: CaseSensitive,
  };
};
