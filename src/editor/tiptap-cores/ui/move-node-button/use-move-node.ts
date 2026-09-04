import { useCallback, useEffect, useState } from "react";

import { TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import { getAnchorNodeAndPos } from "../../lib/tiptap-utils";

type Direction = "up" | "down";

export interface UseMoveNodeConfig {
  editor?: Editor | null;
  direction: Direction;
  hideWhenUnavailable?: boolean;
  onMoved?: (direction: Direction) => void;
}

const SHORTCUT_KEYS: Record<Direction, string> = {
  up: "mod+shift+up",
  down: "mod+shift+down",
};

const canMoveNode = (editor: Editor | null, direction: Direction): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  const nodeInfo = getAnchorNodeAndPos(editor);
  if (!nodeInfo) {
    return false;
  }

  try {
    const $pos = editor.state.doc.resolve(nodeInfo.pos);
    const index = $pos.index();

    return direction === "up" ? index > 0 : index < $pos.parent.childCount - 1;
  } catch {
    return false;
  }
};

export const moveNode = (
  editor: Editor | null,
  direction: Direction,
): boolean => {
  if (!canMoveNode(editor, direction)) {
    return false;
  }

  const nodeInfo = getAnchorNodeAndPos(editor);
  if (!nodeInfo) {
    return false;
  }

  try {
    const { pos, node } = nodeInfo;
    const cursorOffsetFromNode = editor!.state.selection.anchor - pos;

    const tr = editor!.state.tr;
    const $pos = tr.doc.resolve(pos);
    const parent = $pos.parent;
    const index = $pos.index();

    if (index < 0 || index >= parent.childCount) {
      return false;
    }

    let insertPos: number;
    const movedNode = node.type.create(node.attrs, node.content, node.marks);

    if (direction === "up") {
      const prevSize = parent.child(index - 1).nodeSize;
      tr.deleteRange(pos, pos + node.nodeSize);
      insertPos = pos - prevSize;
    } else {
      const nextSize = parent.child(index + 1).nodeSize;
      tr.deleteRange(pos, pos + node.nodeSize);
      insertPos = pos + nextSize;
    }

    tr.insert(insertPos, movedNode);
    tr.setSelection(
      TextSelection.create(tr.doc, insertPos + cursorOffsetFromNode),
    );

    editor!.view.dispatch(tr);
    return true;
  } catch {
    return false;
  }
};

const shouldShowButton = ({
  editor,
  direction,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  direction: Direction;
  hideWhenUnavailable: boolean;
}): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  const hasNode = !!getAnchorNodeAndPos(editor);
  if (!hasNode) {
    return false;
  }

  return hideWhenUnavailable ? canMoveNode(editor, direction) : true;
};

export const useMoveNode = ({
  editor: providedEditor,
  direction,
  hideWhenUnavailable = false,
  onMoved,
}: UseMoveNodeConfig) => {
  const { editor } = useTiptapEditor(providedEditor);

  const [isVisible, setIsVisible] = useState(true);
  const [canMove, setCanMove] = useState(false);

  const shortcutKeys = SHORTCUT_KEYS[direction];

  const handleMoveNode = useCallback(() => {
    if (!canMove) {
      return false;
    }

    const success = moveNode(editor, direction);
    if (success) {
      onMoved?.(direction);
    }
    return success;
  }, [editor, direction, onMoved, canMove]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const update = () => {
      setIsVisible(
        shouldShowButton({ editor, direction, hideWhenUnavailable }),
      );
      setCanMove(canMoveNode(editor, direction));
    };

    update();

    editor.on("selectionUpdate", update);

    return () => {
      editor.off("selectionUpdate", update);
    };
  }, [editor, direction, hideWhenUnavailable]);

  return {
    isVisible,
    handleMoveNode,
    canMoveNode: canMove,
    label: direction === "up" ? "Move Up" : "Move Down",
    shortcutKeys,
    Icon: direction === "up" ? ArrowUp : ArrowDown,
  };
};
