import "./lib.css";

export { createContentExtensions } from "./editor/content-extensions";
export { CONTENT_SCOPE_CLASS } from "./editor/content-scope";
export { FixedToolbar } from "./editor/fixed-toolbar";
export { MobileToolbar } from "./editor/mobile-toolbar";
export {
  EDITOR_SCOPE_CLASS,
  getEditorPortalRoot,
} from "./editor/portal-root";
export type { RichTextEditorProps } from "./editor/rich-text-editor";
export { RichTextEditor } from "./editor/rich-text-editor";
export { SelectionToolbar } from "./editor/selection-toolbar";
export type { EditorImageUploadHandler } from "./editor/tiptap-cores/hooks/use-editor-image-upload";
export { highlightCodeBlocks } from "./editor/tiptap-cores/nodes/code-block-node/code-block-highlight";
export { resizeTweetEmbeds } from "./editor/tiptap-cores/nodes/tweet-embed-node/tweet-embed-utils";
export type { EditorVideoUploadHandler } from "./editor/tiptap-cores/nodes/video-node/video-upload-node-extension";
export { ToC, ToCEmptyState, ToCItem } from "./editor/toc";
export type {
  StreamCompletionFn,
  StreamCompletionParams,
} from "./editor/use-ai-assist-stream";
export { useAiAssistStream } from "./editor/use-ai-assist-stream";
