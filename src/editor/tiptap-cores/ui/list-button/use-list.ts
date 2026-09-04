import { useCallback, useEffect, useState } from "react";

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { List, ListChecks, ListOrdered } from "lucide-react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
} from "../../lib/tiptap-utils";

export type ListType = "bulletList" | "orderedList" | "taskList";

export interface UseListConfig {
  editor?: Editor | null;
  type: ListType;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

const listIcons = {
  bulletList: List,
  orderedList: ListOrdered,
  taskList: ListChecks,
};

const listLabels = {
  bulletList: "Bullet list",
  orderedList: "Numbered list",
  taskList: "Task list",
};

const LIST_SHORTCUT_KEYS = {
  bulletList: "mod+shift+8",
  orderedList: "mod+shift+7",
  taskList: "mod+shift+9",
};

const canToggleList = (editor: Editor | null, type: ListType): boolean => {
  if (
    !editor?.isEditable ||
    !isNodeInSchema(type, editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  try {
    const { state } = editor.view;
    const { selection } = state;

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

const isListActive = (editor: Editor | null, type: ListType): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  switch (type) {
    case "bulletList":
      return editor.isActive("bulletList");
    case "orderedList":
      return editor.isActive("orderedList");
    case "taskList":
      return editor.isActive("taskList");
    default:
      return false;
  }
};

const toggleList = (editor: Editor | null, type: ListType): boolean => {
  if (!canToggleList(editor, type)) {
    return false;
  }

  try {
    const { view } = editor!;
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

    if (editor!.isActive(type)) {
      chain
        .liftListItem("listItem")
        .lift("bulletList")
        .lift("orderedList")
        .lift("taskList")
        .run();
    } else {
      const toggleMap: Record<ListType, () => typeof chain> = {
        bulletList: () => chain.toggleBulletList(),
        orderedList: () => chain.toggleOrderedList(),
        taskList: () => chain.toggleList("taskList", "taskItem"),
      };

      const toggle = toggleMap[type];
      if (!toggle) {
        return false;
      }

      toggle().run();
    }

    editor!.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
};

const shouldShowButton = ({
  editor,
  type,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  type: ListType;
  hideWhenUnavailable: boolean;
}): boolean => {
  if (!editor?.isEditable || !isNodeInSchema(type, editor)) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleList(editor, type);
  }

  return true;
};

export const useList = ({
  editor: providedEditor,
  type,
  hideWhenUnavailable = false,
  onToggled,
}: UseListConfig) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);
  const canToggle = canToggleList(editor, type);
  const isActive = isListActive(editor, type);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, type, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, type, hideWhenUnavailable]);

  const handleToggle = useCallback(() => {
    if (!editor) {
      return false;
    }

    const success = toggleList(editor, type);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, type, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: listLabels[type],
    shortcutKeys: LIST_SHORTCUT_KEYS[type],
    Icon: listIcons[type],
  };
};
