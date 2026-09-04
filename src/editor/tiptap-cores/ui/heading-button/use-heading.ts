import { useCallback, useEffect, useState } from "react";

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "lucide-react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
} from "../../lib/tiptap-utils";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface UseHeadingConfig {
  editor?: Editor | null;
  level: HeadingLevel;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

const headingIcons = {
  1: Heading1,
  2: Heading2,
  3: Heading3,
  4: Heading4,
  5: Heading5,
  6: Heading6,
};

const HEADING_SHORTCUT_KEYS = {
  1: "ctrl+alt+1",
  2: "ctrl+alt+2",
  3: "ctrl+alt+3",
  4: "ctrl+alt+4",
  5: "ctrl+alt+5",
  6: "ctrl+alt+6",
};

const canToggle = (editor: Editor | null): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  if (
    !isNodeInSchema("heading", editor) ||
    isNodeTypeSelected(editor, ["image"])
  ) {
    return false;
  }

  try {
    const view = editor.view;
    const state = view.state;
    const selection = state.selection;

    if (selection.empty || selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
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

const isHeadingActive = (
  editor: Editor | null,
  level?: HeadingLevel | HeadingLevel[],
): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  if (Array.isArray(level)) {
    return level.some((l) => editor.isActive("heading", { level: l }));
  }

  return level
    ? editor.isActive("heading", { level })
    : editor.isActive("heading");
};

const toggleHeading = (
  editor: Editor | null,
  level: HeadingLevel | HeadingLevel[],
): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  const levels = Array.isArray(level) ? level : [level];
  const toggleLevel = canToggle(editor) ? levels[0] : undefined;

  if (!toggleLevel) {
    return false;
  }

  try {
    const view = editor.view;
    let state = view.state;
    let tr = state.tr;

    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;

      if (!isValidPosition(pos)) {
        return false;
      }

      tr = tr.setSelection(NodeSelection.create(state.doc, pos));
      view.dispatch(tr);
      state = view.state;
    }

    const selection = state.selection;
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

    const isActive = levels.some((l) =>
      editor.isActive("heading", { level: l }),
    );

    const toggle = isActive
      ? chain.setNode("paragraph")
      : chain.setNode("heading", { level: toggleLevel });

    toggle.run();

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
};

const shouldShowButton = (props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean => {
  const { editor, hideWhenUnavailable } = props;

  if (!editor?.isEditable) {
    return false;
  }

  if (!isNodeInSchema("heading", editor)) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggle(editor);
  }

  return true;
};

export const useHeading = (config: UseHeadingConfig) => {
  const {
    editor: providedEditor,
    level,
    hideWhenUnavailable = false,
    onToggled,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggleState = canToggle(editor);
  const isActive = isHeadingActive(editor, level);

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
  }, [editor, level, hideWhenUnavailable]);

  const handleToggle = useCallback(() => {
    if (!editor) {
      return false;
    }

    const success = toggleHeading(editor, level);

    if (success) {
      onToggled?.();
    }

    return success;
  }, [editor, level, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle: canToggleState,
    label: `Heading ${level}`,
    shortcutKeys: HEADING_SHORTCUT_KEYS[level],
    Icon: headingIcons[level],
  };
};
