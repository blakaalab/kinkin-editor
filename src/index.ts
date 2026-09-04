import "./lib.css";

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
export { ToC, ToCEmptyState, ToCItem } from "./editor/toc";
export type {
  StreamCompletionFn,
  StreamCompletionParams,
} from "./editor/use-ai-assist-stream";
export { useAiAssistStream } from "./editor/use-ai-assist-stream";
