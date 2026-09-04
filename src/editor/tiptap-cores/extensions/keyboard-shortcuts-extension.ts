import { Extension } from "@tiptap/core";

import { duplicateNode } from "../ui/duplicate-node-button/use-duplicate-node";
import { moveNode } from "../ui/move-node-button/use-move-node";

// useHotkeys doesn't work for these cases — shortcuts must be overridden at the editor level
export const KeyboardShortcuts = Extension.create({
  name: "keyboardShortcuts",

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-ArrowUp": ({ editor }) => {
        return moveNode(editor, "up");
      },
      "Mod-Shift-ArrowDown": ({ editor }) => {
        return moveNode(editor, "down");
      },
      "Mod-Shift-d": ({ editor }) => {
        return duplicateNode(editor);
      },
    };
  },
});
