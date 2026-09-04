import type { Editor } from "@tiptap/react";

import { isNodeTypeSelected } from "../../lib/tiptap-utils";

const canInsertSlashCommand = (editor: Editor | null): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  if (isNodeTypeSelected(editor, ["image"])) {
    return false;
  }

  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type.name === "table") {
      return false;
    }
  }

  return true;
};

const simulateTyping = (text: string): void => {
  document.execCommand("insertText", false, text);
};

const positionCursorAtNode = (editor: Editor, nodePos: number): boolean => {
  const $pos = editor.state.doc.resolve(nodePos);
  const node = $pos.nodeAfter;

  if (!node) {
    return false;
  }

  const isEmpty = node.textContent.length === 0;
  const insidePos = nodePos + 1;

  if (isEmpty) {
    editor.commands.setTextSelection(insidePos);

    return true;
  }

  const afterPos = nodePos + node.nodeSize;
  editor
    .chain()
    .insertContentAt(afterPos, { type: "paragraph" })
    .setTextSelection(afterPos + 1)
    .run();

  return true;
};

const positionCursorAtSelection = (editor: Editor): boolean => {
  const { $from } = editor.state.selection;

  if ($from.parent.textContent.length === 0) {
    return true;
  }

  editor
    .chain()
    .insertContentAt($from.after(), { type: "paragraph" })
    .setTextSelection($from.after() + 1)
    .run();

  return true;
};

export const insertSlashCommand = (
  editor: Editor | null,
  trigger: string = "/",
  nodePos?: number,
): boolean => {
  if (!editor?.isEditable || !canInsertSlashCommand(editor)) {
    return false;
  }

  const doInsert = () => {
    if (nodePos !== undefined && nodePos >= 0) {
      positionCursorAtNode(editor, nodePos);
    } else {
      positionCursorAtSelection(editor);
    }
    simulateTyping(trigger);
  };

  if (!editor.isFocused) {
    editor.commands.focus();
    requestAnimationFrame(() => {
      requestAnimationFrame(doInsert);
    });
  } else {
    doInsert();
  }

  return true;
};
