import type { EmojiItem } from "@tiptap/extension-emoji";
import type { Node } from "@tiptap/pm/model";
import type { Transaction } from "@tiptap/pm/state";
import type { Step } from "@tiptap/pm/transform";
import type { Editor } from "@tiptap/react";

import {
  findNodePosition,
  isNodeTypeSelected,
  isValidPosition,
} from "../../lib/tiptap-utils";

interface TransactionSliceNode {
  type: string;
  text?: string;
  content?: TransactionSliceNode[];
}

const sliceNodeContainsChar = (
  node: TransactionSliceNode,
  char: string,
): boolean => {
  if (node.type === "text" && node.text?.includes(char)) {
    return true;
  }

  if (node.content) {
    return node.content.some((n) => sliceNodeContainsChar(n, char));
  }

  return false;
};

const getSliceNodeLength = (node: TransactionSliceNode): number => {
  if (node.type === "text") {
    return node.text?.length || 0;
  }

  if (node.content) {
    return (
      node.content.reduce((acc, child) => acc + getSliceNodeLength(child), 0) +
      2
    );
  }

  return 1;
};

export const wasSpaceJustTyped = (transaction: Transaction): boolean => {
  if (!transaction.docChanged) {
    return false;
  }

  for (let i = 0; i < transaction.steps.length; i++) {
    const step = transaction.steps[i] as Step;
    const stepJson = step.toJSON() as {
      stepType?: string;
      slice?: { content?: TransactionSliceNode[] };
    };

    if (
      stepJson.stepType === "replace" &&
      stepJson.slice?.content?.some((n) => sliceNodeContainsChar(n, " "))
    ) {
      return true;
    }
  }

  return false;
};

export const isColonJustInserted = (
  transaction: Transaction,
  colonPos: number,
): boolean => {
  if (!transaction.docChanged) {
    return false;
  }

  for (let i = 0; i < transaction.steps.length; i++) {
    const step = transaction.steps[i] as Step;
    const stepJson = step.toJSON() as {
      stepType?: string;
      from?: number;
      slice?: { content?: TransactionSliceNode[] };
    };

    if (stepJson.stepType === "replace" && stepJson.from !== undefined) {
      const slice = stepJson.slice;

      if (slice?.content?.some((n) => sliceNodeContainsChar(n, ":"))) {
        const insertedLength = slice.content.reduce(
          (acc, node) => acc + getSliceNodeLength(node),
          0,
        );

        if (
          colonPos >= stepJson.from &&
          colonPos < stepJson.from + insertedLength
        ) {
          return true;
        }
      }
    }
  }

  return false;
};

export const getFilteredEmojis = <T extends EmojiItem>(props: {
  query: string;
  emojis: T[];
}) => {
  const { query, emojis } = props;
  const trimmedQuery = query.trim().toLowerCase();

  const filteredEmojis = !trimmedQuery
    ? emojis.slice(0, 100)
    : emojis
        .filter(
          (emoji) =>
            emoji.name.toLowerCase().includes(trimmedQuery) ||
            emoji.shortcodes.some((s) =>
              s.toLowerCase().includes(trimmedQuery),
            ) ||
            emoji.tags.some((t) => t.toLowerCase().includes(trimmedQuery)),
        )
        .slice(0, 100);

  return filteredEmojis.sort((a, b) => a.name.localeCompare(b.name));
};

const insertTriggerInBlockNode = (
  editor: Editor,
  trigger: string,
  node?: Node | null,
  nodePos?: number | null,
): boolean => {
  if ((node !== undefined && node !== null) || isValidPosition(nodePos)) {
    const foundPos = findNodePosition({
      editor,
      node: node || undefined,
      nodePos: nodePos || undefined,
    });

    if (!foundPos) {
      return false;
    }

    const isEmpty =
      foundPos.node.type.name === "paragraph" &&
      foundPos.node.content.size === 0;
    const posAndNodeSize = foundPos.pos + foundPos.node.nodeSize;

    return editor
      .chain()
      .insertContentAt(isEmpty ? foundPos.pos : posAndNodeSize, {
        type: "paragraph",
        content: [{ type: "text", text: trigger }],
      })
      .focus(isEmpty ? foundPos.pos + 2 : posAndNodeSize + trigger.length + 1)
      .run();
  }

  const { $from } = editor.state.selection;

  return editor
    .chain()
    .insertContentAt($from.after(), {
      type: "paragraph",
      content: [{ type: "text", text: trigger }],
    })
    .focus()
    .run();
};

const insertTriggerInTextNode = (
  editor: Editor,
  trigger: string,
  node?: Node | null,
  nodePos?: number | null,
): boolean => {
  if ((node !== undefined && node !== null) || isValidPosition(nodePos)) {
    const foundPos = findNodePosition({
      editor,
      node: node || undefined,
      nodePos: nodePos || undefined,
    });

    if (!foundPos) {
      return false;
    }

    const isEmpty =
      foundPos.node.type.name === "paragraph" &&
      foundPos.node.content.size === 0;
    const posAndNodeSize = foundPos.pos + foundPos.node.nodeSize;

    editor.view.dispatch(
      editor.view.state.tr
        .scrollIntoView()
        .insertText(
          trigger,
          isEmpty ? foundPos.pos : posAndNodeSize,
          isEmpty ? foundPos.pos : posAndNodeSize,
        ),
    );

    editor.commands.focus(
      isEmpty ? foundPos.pos + 2 : posAndNodeSize + trigger.length + 1,
    );

    return true;
  }

  const { $from } = editor.state.selection;
  const currentNode = $from.node();

  const hasContentBefore =
    $from.parentOffset > 0 &&
    currentNode.textContent[$from.parentOffset - 1] !== " ";

  return editor
    .chain()
    .insertContent({
      type: "text",
      text: hasContentBefore ? ` ${trigger}` : trigger,
    })
    .focus()
    .run();
};

export const addEmojiTrigger = (
  editor: Editor | null,
  trigger: string = ":",
  node?: Node | null,
  nodePos?: number | null,
): boolean => {
  if (!editor?.isEditable || isNodeTypeSelected(editor, ["image"])) {
    return false;
  }

  try {
    const { $from } = editor.state.selection;
    const currentNode = $from.node();
    const isBlockNode = currentNode.isBlock && !currentNode.isTextblock;

    if (isBlockNode) {
      return insertTriggerInBlockNode(editor, trigger, node, nodePos);
    }

    return insertTriggerInTextNode(editor, trigger, node, nodePos);
  } catch {
    return false;
  }
};
