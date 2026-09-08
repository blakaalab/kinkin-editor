import { TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";

import { getAnchorNodeAndPos } from "../../lib/tiptap-utils";

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
