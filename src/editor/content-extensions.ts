import type { Extensions } from "@tiptap/core";
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji";
import { Highlight } from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { ListItem, TaskItem, TaskList } from "@tiptap/extension-list";
import { Mention } from "@tiptap/extension-mention";
import { Strike } from "@tiptap/extension-strike";
import { TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { TableOfContents } from "@tiptap/extension-table-of-contents";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { UniqueID } from "@tiptap/extension-unique-id";
import type { StarterKitOptions } from "@tiptap/starter-kit";
import { StarterKit } from "@tiptap/starter-kit";

import { HorizontalRule } from "@/editor/tiptap-cores/nodes/horizontal-rule-node/horizontal-rule-node-extension";
import { ImageUploadNode } from "@/editor/tiptap-cores/nodes/image-node/image-upload-node-schema";
import { ContentTable } from "@/editor/tiptap-cores/nodes/table-node/table-node-schema";

/**
 * The `StarterKit` entries that decide which nodes and marks exist. Shared by
 * both extension lists, so neither can quietly gain a node the other lacks.
 */
export const CONTENT_STARTER_KIT_OPTIONS = {
  // Each is replaced below by a version this editor needs instead.
  horizontalRule: false,
  strike: false,
  listItem: false,
} satisfies Partial<StarterKitOptions>;

/** Nodes that carry a stable `data-id`, for anchors and scroll-to-hash. */
export const UNIQUE_ID_TYPES = [
  "paragraph",
  "bulletList",
  "orderedList",
  "taskList",
  "heading",
  "blockquote",
  "codeBlock",
];

/** Regional-indicator letters are combining characters, not usable emoji. */
const EMOJIS = gitHubEmojis.filter((emoji) => !emoji.name.includes("regional"));

/**
 * Marks AI Assist writes while streaming, so a suggestion can be styled as
 * inserted or deleted text. It is a schema attribute: a document saved
 * mid-stream carries it, and rendering must not drop it.
 */
const aiAssistAttribute = {
  default: null,
  parseHTML: (element: HTMLElement) =>
    element.getAttribute("data-ai-assist") || null,
  renderHTML: (attributes: { aiAssist?: string | null }) =>
    attributes.aiAssist ? { "data-ai-assist": attributes.aiAssist } : {},
};

export const AiAssistStrike = Strike.extend({
  addAttributes() {
    return { ...this.parent?.(), aiAssist: aiAssistAttribute };
  },
});

export const AiAssistHighlight = Highlight.extend({
  addAttributes() {
    return { ...this.parent?.(), aiAssist: aiAssistAttribute };
  },
}).configure({ multicolor: true });

/** List items hold blocks, so a bullet can contain a table or a code block. */
export const BlockListItem = ListItem.extend({ content: "block+" });

/** Cells hold paragraphs only — no nested lists, tables or headings. */
export const ParagraphTableHeader = TableHeader.extend({
  content: "paragraph+",
});
export const ParagraphTableCell = TableCell.extend({ content: "paragraph+" });

export const NestedTaskItem = TaskItem.configure({ nested: true });

export const ContentEmoji = Emoji.configure({
  emojis: EMOJIS,
  forceFallbackImages: true,
});

export const ContentUniqueId = UniqueID.configure({ types: UNIQUE_ID_TYPES });

/**
 * Every extension that shapes the document: nodes, marks and the attributes on
 * them, and nothing that only exists to make editing work.
 *
 * This is the list to render a saved document with — `generateHTML(doc,
 * createContentExtensions())`. Rendering with anything less throws on the first
 * node the schema does not know, so `<RichTextEditor />` builds its own
 * extensions on top of this exact list: a node added here reaches both, and the
 * two cannot drift.
 *
 * Pair it with `@blakaa/kinkin-editor/content.css`, which styles the markup
 * these produce. Note that `generateHTML` needs a DOM — on a server, run it
 * with jsdom or happy-dom installed.
 */
export const createContentExtensions = (): Extensions => [
  StarterKit.configure({
    ...CONTENT_STARTER_KIT_OPTIONS,
    // Plugin-only entries. Nothing they do reaches rendered HTML, and each one
    // left on is a ProseMirror plugin instantiated for nothing.
    undoRedo: false,
    dropcursor: false,
    gapcursor: false,
    listKeymap: false,
    trailingNode: false,
  }),
  BlockListItem,
  HorizontalRule,
  ContentTable,
  TableRow,
  ParagraphTableHeader,
  ParagraphTableCell,
  Mention,
  ContentEmoji,
  Color,
  TextStyle,
  TaskList,
  NestedTaskItem,
  AiAssistStrike,
  AiAssistHighlight,
  ContentUniqueId,
  Image,
  ImageUploadNode,
  // Not a rendering concern at first glance, but it owns the `id` and
  // `data-toc-id` attributes on headings. Leave it out and every heading in a
  // rendered document loses its anchor, breaking table-of-contents links.
  TableOfContents,
];
