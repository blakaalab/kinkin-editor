/**
 * `@blakaa/kinkin-editor/content` — rendering a saved document outside the
 * editor.
 *
 * A separate entry point on purpose: importing it pulls in the schema and
 * nothing else. No React components, no editor stylesheet, no browser-only
 * code, so it is safe in a server component or a static build.
 *
 *   import { generateHTML } from "@tiptap/core";
 *   import { createContentExtensions, CONTENT_SCOPE_CLASS } from "@blakaa/kinkin-editor/content";
 *   import "@blakaa/kinkin-editor/content.css";
 *
 *   const html = generateHTML(doc, createContentExtensions());
 *   <div className={CONTENT_SCOPE_CLASS} dangerouslySetInnerHTML={{ __html: html }} />
 */
export {
  AiAssistHighlight,
  AiAssistStrike,
  BlockListItem,
  CONTENT_STARTER_KIT_OPTIONS,
  ContentEmoji,
  ContentUniqueId,
  createContentExtensions,
  NestedTaskItem,
  ParagraphTableCell,
  ParagraphTableHeader,
  UNIQUE_ID_TYPES,
} from "./editor/content-extensions";
export { CONTENT_SCOPE_CLASS } from "./editor/content-scope";
export { HorizontalRule } from "./editor/tiptap-cores/nodes/horizontal-rule-node/horizontal-rule-node-extension";
export { ImageUploadNode } from "./editor/tiptap-cores/nodes/image-node/image-upload-node-schema";
export {
  CELL_MIN_WIDTH,
  ContentTable,
} from "./editor/tiptap-cores/nodes/table-node/table-node-schema";
