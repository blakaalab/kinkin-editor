import { Extension } from "@tiptap/core";
import type { Node as PmNode, Slice } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const ALLOWED_TABLE_NODE_TYPES = new Set(["paragraph", "text"]);
const BLOCKED_IN_BLOCKQUOTE = new Set(["table", "image", "imageUpload"]);

const findRestrictedAncestor = (
  doc: PmNode,
  pos: number,
): "table" | "blockquote" | null => {
  const $pos = doc.resolve(pos);
  for (let depth = $pos.depth; depth > 0; depth--) {
    const name = $pos.node(depth).type.name;
    if (name === "table") return "table";
    if (name === "blockquote") return "blockquote";
  }
  return null;
};

const hasDisallowedTableNode = (node: PmNode): boolean => {
  if (!ALLOWED_TABLE_NODE_TYPES.has(node.type.name)) return true;
  let found = false;
  node.content.forEach((child) => {
    if (found) return;
    if (hasDisallowedTableNode(child)) found = true;
  });
  return found;
};

const hasBlockedBlockquoteNode = (node: PmNode): boolean => {
  if (BLOCKED_IN_BLOCKQUOTE.has(node.type.name)) return true;
  let found = false;
  node.content.forEach((child) => {
    if (found) return;
    if (hasBlockedBlockquoteNode(child)) found = true;
  });
  return found;
};

const isDropBlocked = (
  ancestor: "table" | "blockquote",
  slice: Slice,
): boolean => {
  const check =
    ancestor === "table" ? hasDisallowedTableNode : hasBlockedBlockquoteNode;
  let found = false;
  slice.content.forEach((node) => {
    if (found) return;
    if (check(node)) found = true;
  });
  return found;
};

export const DropGuard = Extension.create({
  name: "dropGuard",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("dropGuard"),
        props: {
          handleDrop(view, event, slice) {
            if (!event || !slice) return false;
            const coords = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            if (!coords) return false;
            const ancestor = findRestrictedAncestor(view.state.doc, coords.pos);
            if (ancestor && isDropBlocked(ancestor, slice)) {
              event.preventDefault();
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});
