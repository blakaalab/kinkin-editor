import type { Schema, Node as TiptapNode } from "@tiptap/pm/model";
import { Fragment } from "@tiptap/pm/model";
import { EditorState, NodeSelection, type Selection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { isNodeSelection, isTextSelection, posToDOMRect } from "@tiptap/react";

const MAC_SYMBOLS: Record<string, string> = {
  mod: "⌘",
  command: "⌘",
  meta: "⌘",
  ctrl: "⌃",
  control: "⌃",
  alt: "⌥",
  option: "⌥",
  shift: "⇧",
  backspace: "Del",
  delete: "⌦",
  enter: "⏎",
  escape: "⎋",
  capslock: "⇪",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
} as const;

export const cn = (
  ...classes: (string | boolean | undefined | null)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

const isMac = (): boolean => {
  return (
    typeof navigator !== "undefined" &&
    navigator.platform.toLowerCase().includes("mac")
  );
};

const formatShortcutKey = (
  key: string,
  isMac: boolean,
  capitalize: boolean = true,
) => {
  if (isMac) {
    const lowerKey = key.toLowerCase();
    return MAC_SYMBOLS[lowerKey] || (capitalize ? key.toUpperCase() : key);
  }

  return capitalize ? key.charAt(0).toUpperCase() + key.slice(1) : key;
};

export const parseShortcutKeys = (props: {
  shortcutKeys: string | undefined;
  delimiter?: string;
  capitalize?: boolean;
}) => {
  const { shortcutKeys, delimiter = "+", capitalize = true } = props;

  if (!shortcutKeys) {
    return [];
  }

  return shortcutKeys
    .split(delimiter)
    .map((key) => key.trim())
    .map((key) => formatShortcutKey(key, isMac(), capitalize));
};

export const isMarkInSchema = (
  markName: string,
  editor: Editor | null,
): boolean => {
  if (!editor?.schema) {
    return false;
  }

  return editor.schema.spec.marks.get(markName) !== undefined;
};

export const isNodeInSchema = (
  nodeName: string,
  editor: Editor | null,
): boolean => {
  if (!editor?.schema) {
    return false;
  }

  return editor.schema.spec.nodes.get(nodeName) !== undefined;
};

export const isValidPosition = (
  pos: number | null | undefined,
): pos is number => {
  return typeof pos === "number" && pos >= 0;
};

const findNodeAtPosition = (editor: Editor, position: number) => {
  return editor.state.doc.nodeAt(position) ?? null;
};

export const findNodePosition = (props: {
  editor: Editor | null;
  node?: TiptapNode | null;
  nodePos?: number | null;
}): { pos: number; node: TiptapNode } | null => {
  const { editor, node, nodePos } = props;

  if (!editor?.state?.doc) {
    return null;
  }

  const hasValidNode = node !== undefined && node !== null;
  const hasValidPos = isValidPosition(nodePos);

  if (!hasValidNode && !hasValidPos) {
    return null;
  }

  if (hasValidNode) {
    let foundPos = -1;
    let foundNode: TiptapNode | null = null;

    editor.state.doc.descendants((currentNode, pos) => {
      if (currentNode === node) {
        foundPos = pos;
        foundNode = currentNode;
        return false;
      }
      return true;
    });

    if (foundPos !== -1 && foundNode !== null) {
      return { pos: foundPos, node: foundNode };
    }
  }

  if (hasValidPos) {
    const nodeAtPos = findNodeAtPosition(editor, nodePos!);
    if (nodeAtPos) {
      return { pos: nodePos!, node: nodeAtPos };
    }
  }

  return null;
};

export const isNodeTypeSelected = (
  editor: Editor | null,
  types: string[] = [],
): boolean => {
  if (!editor?.state.selection) {
    return false;
  }

  const { state } = editor;
  const { selection } = state;

  if (selection.empty) {
    return false;
  }

  if (selection instanceof NodeSelection) {
    const node = selection.node;
    return node ? types.includes(node.type.name) : false;
  }

  return false;
};

export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const getAnchorNodeAndPos = (
  editor: Editor | null,
  allowEmptySelection: boolean = true,
): { node: TiptapNode; pos: number } | null => {
  if (!editor) {
    return null;
  }

  const { state } = editor;
  const { selection } = state;

  if (selection instanceof NodeSelection) {
    const node = selection.node;
    const pos = selection.from;

    if (node && isValidPosition(pos)) {
      return { node, pos };
    }
  }

  if (selection.empty && !allowEmptySelection) {
    return null;
  }

  const $anchor = selection.$anchor;
  const depth = 1;
  const node = $anchor.node(depth);
  const pos = $anchor.before(depth);

  return { node, pos };
};

export const getEditorExtension = (
  editor: Editor | null,
  extensionName: string,
) => {
  if (!editor) {
    return null;
  }

  return (
    editor.extensionManager.extensions.find(
      (ext) => ext.name === extensionName,
    ) ?? null
  );
};

export type OverflowPosition = "none" | "top" | "bottom" | "both";

export const getElementOverflowPosition = (
  targetElement: Element,
  containerElement: HTMLElement,
): OverflowPosition => {
  const targetBounds = targetElement.getBoundingClientRect();
  const containerBounds = containerElement.getBoundingClientRect();

  const isOverflowingTop = targetBounds.top < containerBounds.top;
  const isOverflowingBottom = targetBounds.bottom > containerBounds.bottom;

  if (isOverflowingTop && isOverflowingBottom) {
    return "both";
  }

  if (isOverflowingTop) {
    return "top";
  }

  if (isOverflowingBottom) {
    return "bottom";
  }

  return "none";
};

export const isSelectionValid = (
  editor: Editor | null,
  selection?: Selection,
  excludedNodeTypes: string[] = ["imageUpload", "horizontalRule", "table"],
): boolean => {
  if (!editor) {
    return false;
  }

  if (!selection) {
    selection = editor.state.selection;
  }

  const { state } = editor;
  const { doc } = state;
  const { empty, from, to } = selection;

  if (!isTextSelection(selection) && !isNodeSelection(selection)) {
    return false;
  }

  const hasNoTextContent = !doc.textBetween(from, to).length;
  const isExcludedNode =
    isNodeSelection(selection) &&
    excludedNodeTypes.includes(selection.node.type.name);

  return !empty && !hasNoTextContent && !isExcludedNode;
};

export const isTextSelectionValid = (editor: Editor | null): boolean => {
  if (!editor) {
    return false;
  }

  const { state } = editor;
  const { selection } = state;

  return (
    isTextSelection(selection) &&
    !selection.empty &&
    !isNodeSelection(selection)
  );
};

export const getSelectionBoundingRect = (editor: Editor): DOMRect | null => {
  const { state, view } = editor;
  const { selection } = state;
  const { ranges } = selection;

  const from = Math.min(...ranges.map((range) => range.$from.pos));
  const to = Math.max(...ranges.map((range) => range.$to.pos));

  if (isNodeSelection(selection)) {
    const node = view.nodeDOM(from) as HTMLElement;
    if (node) {
      return node.getBoundingClientRect();
    }
  }

  try {
    const fromPos = view.domAtPos(from);
    const toPos = view.domAtPos(to);

    if (fromPos.node && toPos.node) {
      const range = document.createRange();
      range.setStart(fromPos.node, fromPos.offset);
      range.setEnd(toPos.node, toPos.offset);

      const rect = range.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        return rect;
      }
    }
  } catch (_) {
    //
  }

  return posToDOMRect(view, from, to);
};

export const getCurrentNodeBoundingRect = (editor: Editor): DOMRect | null => {
  const { state, view } = editor;
  const { selection } = state;
  const $anchor = selection.$anchor;

  // Get the node at depth 1 (typically paragraph/block level)
  const depth = 1;
  const pos = $anchor.before(depth);

  // Get the DOM element for this node
  const domNode = view.nodeDOM(pos);
  if (domNode && domNode instanceof HTMLElement) {
    return domNode.getBoundingClientRect();
  }

  // Fallback to selection rect
  return getSelectionBoundingRect(editor);
};

// Extracts surrounding context (prev + current + next top-level nodes) around a selection.
// Non-text nodes are serialized using the editor's content type (e.g. hr → ---).
// If an adjacent node is non-text, includes it and grabs one more node beyond.
export const getSurroundingContext = (
  editor: Editor,
  from: number,
  to: number,
) => {
  const doc = editor.state.doc;
  const $from = doc.resolve(from);
  const $to = doc.resolve(to);

  if ($from.depth < 1 || $to.depth < 1) {
    return {};
  }

  const fromNodeIndex = $from.index(0);
  const toNodeIndex = $to.index(0);

  // Walk backward: get 1 prev node, expand 1 more if it's non-text
  const beforeParts: string[] = [];
  if (fromNodeIndex > 0) {
    const prev = doc.child(fromNodeIndex - 1);
    if (!prev.isTextblock && fromNodeIndex - 2 >= 0) {
      const text = serializeNode(editor, doc.child(fromNodeIndex - 2));
      if (text) beforeParts.push(text);
    }
    const prevText = serializeNode(editor, prev);
    if (prevText) beforeParts.push(prevText);
  }
  const inlineBeforeText = doc.textBetween($from.start(1), from, "\n").trim();
  if (inlineBeforeText) beforeParts.push(inlineBeforeText);

  // Walk forward: get 1 next node, expand 1 more if it's non-text
  const afterParts: string[] = [];
  const inlineAfterText = doc.textBetween(to, $to.end(1), "\n").trim();
  if (inlineAfterText) afterParts.push(inlineAfterText);
  if (toNodeIndex < doc.childCount - 1) {
    const next = doc.child(toNodeIndex + 1);
    const nextText = serializeNode(editor, next);
    if (nextText) afterParts.push(nextText);
    if (!next.isTextblock && toNodeIndex + 2 < doc.childCount) {
      const text = serializeNode(editor, doc.child(toNodeIndex + 2));
      if (text) afterParts.push(text);
    }
  }

  const selectedText = doc.textBetween(from, to, "\n").trim();

  return {
    beforeSelectedText: beforeParts.join("\n"),
    selectedText,
    afterSelectedText: afterParts.join("\n"),
  };
};

// Serializes a node using the editor's content type (markdown via @tiptap/markdown, or fallback to text)
const serializeNode = (editor: Editor, node: TiptapNode): string => {
  if (editor.markdown) {
    return editor.markdown.serialize(node.toJSON()).trim();
  }

  return node.textContent;
};

/**
 * Recursively ensures all nodes satisfy their schema content rules.
 * Partial markdown or saved content can produce empty container nodes
 * (e.g. blockquote with no children) that violate `block+` content rules.
 * `createAndFill` fills them with required default content (e.g. an empty paragraph).
 * Returns the original node reference when no changes are needed.
 */
export const sanitizeNode = (node: TiptapNode, schema: Schema): TiptapNode => {
  if (node.isLeaf) return node;

  let changed = false;
  const children: TiptapNode[] = [];
  node.content.forEach((child) => {
    const sanitized = sanitizeNode(child, schema);

    if (sanitized !== child) changed = true;
    children.push(sanitized);
  });

  if (!changed && node.type.validContent(node.content)) {
    return node;
  }

  const content = Fragment.from(children);

  if (node.type.validContent(content)) {
    return node.copy(content);
  }

  const filled = node.type.createAndFill(node.attrs, content, node.marks);

  return (
    filled ?? node.type.createAndFill(node.attrs, null, node.marks) ?? node
  );
};

export const clearEditorHistory = (editor: Editor | null) => {
  if (!editor) return;
  const { state, view } = editor;
  view.updateState(
    EditorState.create({
      doc: state.doc,
      plugins: state.plugins,
      selection: state.selection,
    }),
  );
};
