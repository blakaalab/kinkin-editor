import {
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";

import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji";
import { Highlight } from "@tiptap/extension-highlight";
import { History } from "@tiptap/extension-history";
import Image from "@tiptap/extension-image";
import { ListItem, TaskItem, TaskList } from "@tiptap/extension-list";
import { Mention } from "@tiptap/extension-mention";
import { Strike } from "@tiptap/extension-strike";
import { TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import {
  type TableOfContentDataItem,
  TableOfContents,
} from "@tiptap/extension-table-of-contents";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { UniqueID } from "@tiptap/extension-unique-id";
import { Placeholder, Selection } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import {
  type Content,
  EditorContent,
  EditorContext,
  type JSONContent,
  useEditor,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import { MobileToolbar } from "@/editor/mobile-toolbar";
import { EDITOR_SCOPE_CLASS, getEditorPortalRoot } from "@/editor/portal-root";
import { SelectionToolbar } from "@/editor/selection-toolbar";
import {
  AiAssist,
  type AiAssistRequest,
} from "@/editor/tiptap-cores/extensions/ai-assist-extension";
import { DropGuard } from "@/editor/tiptap-cores/extensions/drop-guard-extension";
import { KeyboardShortcuts } from "@/editor/tiptap-cores/extensions/keyboard-shortcuts-extension";
import { PasteMarkdown } from "@/editor/tiptap-cores/extensions/paste-markdown-extension";
import { StreamContent } from "@/editor/tiptap-cores/extensions/stream-content-extension";
import { UiState } from "@/editor/tiptap-cores/extensions/ui-state-extension";
import {
  type EditorImageUploadHandler,
  useEditorImageUpload,
} from "@/editor/tiptap-cores/hooks/use-editor-image-upload";
import { useScrollToHash } from "@/editor/tiptap-cores/hooks/use-scroll-to-hash";
import { useUiEditorState } from "@/editor/tiptap-cores/hooks/use-ui-editor-state";
import {
  clearEditorHistory,
  sanitizeNode,
} from "@/editor/tiptap-cores/lib/tiptap-utils";
import { HorizontalRule } from "@/editor/tiptap-cores/nodes/horizontal-rule-node/horizontal-rule-node-extension";
import { ImageUpload } from "@/editor/tiptap-cores/nodes/image-node/image-upload-node-extension";
import { CustomTable } from "@/editor/tiptap-cores/nodes/table-node/table-node-extension";
import { AiAssistPanel } from "@/editor/tiptap-cores/ui/ai-assist";
import { EmojiSuggestionMenu } from "@/editor/tiptap-cores/ui/emoji-suggestion-menu";
import { NodeHandle } from "@/editor/tiptap-cores/ui/node-handle";
import { SlashCommandSuggestionMenu } from "@/editor/tiptap-cores/ui/slash-command-suggestion-menu";
import {
  type StreamCompletionFn,
  useAiAssistStream,
} from "@/editor/use-ai-assist-stream";
import { cn } from "@/lib/utils";

import "@/editor/tiptap-cores/styles/index.scss";

import { useCursorVisibility } from "@/editor/tiptap-cores/hooks/use-cursor-visibility";

const createExtensions = () => [
  StarterKit.configure({
    undoRedo: false,
    horizontalRule: false,
    strike: false,
    listItem: false,
    dropcursor: { width: 2, color: false },
    link: { openOnClick: false },
  }),
  ListItem.extend({ content: "block+" }),
  DropGuard,
  HorizontalRule,
  CustomTable,
  TableRow,
  TableHeader.extend({ content: "paragraph+" }),
  TableCell.extend({ content: "paragraph+" }),
  Placeholder.configure({
    placeholder: "Write, type '/' for commands…",
    emptyNodeClass: "is-empty",
  }),
  Mention,
  Emoji.configure({
    emojis: gitHubEmojis.filter((emoji) => !emoji.name.includes("regional")),
    forceFallbackImages: true,
  }),
  Color,
  TextStyle,
  TaskList,
  TaskItem.configure({ nested: true }),
  Strike.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        aiAssist: {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-ai-assist") || null,
          renderHTML: (attributes: { aiAssist?: string | null }) => {
            if (!attributes.aiAssist) {
              return {};
            }
            return {
              "data-ai-assist": attributes.aiAssist,
            };
          },
        },
      };
    },
  }),
  Highlight.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        aiAssist: {
          default: null,
          parseHTML: (element) =>
            element.getAttribute("data-ai-assist") || null,
          renderHTML: (attributes) => {
            if (!attributes.aiAssist) {
              return {};
            }
            return {
              "data-ai-assist": attributes.aiAssist,
            };
          },
        },
      };
    },
  }).configure({ multicolor: true }),
  Selection,
  UniqueID.configure({
    types: [
      "paragraph",
      "bulletList",
      "orderedList",
      "taskList",
      "heading",
      "blockquote",
      "codeBlock",
    ],
  }),
  Typography,
  AiAssist,
  StreamContent,
  UiState,
  KeyboardShortcuts,
  Image,
  ImageUpload,
  History.configure({ depth: 100 }),
  Markdown.configure({
    markedOptions: { gfm: true },
  }),
  PasteMarkdown,
];

interface EditorContentAreaProps {
  onAiAssist: (request: AiAssistRequest) => void;
  onStopAiAssist: () => void;
  onAiChatRequest?: (message: string, selectedText: string) => void;
  aiMode?: "assist" | "chat";
  imageUploadHandler?: EditorImageUploadHandler;
}

function EditorContentArea({
  onAiAssist,
  onStopAiAssist,
  onAiChatRequest,
  aiMode,
  imageUploadHandler,
}: EditorContentAreaProps) {
  const { editor } = useContext(EditorContext)!;
  const { isDragging } = useUiEditorState(editor);

  useEditorImageUpload(editor, { handler: imageUploadHandler });
  useScrollToHash();
  useCursorVisibility({ editor });

  const portalRoot = getEditorPortalRoot();

  if (!editor) {
    return null;
  }

  return (
    <EditorContent
      editor={editor}
      role="presentation"
      className="w-full mx-auto h-full flex flex-col flex-1"
      style={{ cursor: isDragging ? "grabbing" : "auto" }}
    >
      <NodeHandle />
      <EmojiSuggestionMenu />
      <SlashCommandSuggestionMenu />
      <SelectionToolbar onAiChatRequest={onAiChatRequest} aiMode={aiMode} />
      <AiAssistPanel onAiAssist={onAiAssist} onStopAiAssist={onStopAiAssist} />
      {portalRoot && createPortal(<MobileToolbar />, portalRoot)}
    </EditorContent>
  );
}

export interface RichTextEditorProps {
  placeholder?: string;
  initialContent?: Content;
  contentType?: "json" | "html" | "markdown";
  outputContentType?: "json" | "html" | "text" | "markdown";
  onChange?: (
    value: JSONContent | string,
    meta?: { source: "manual" | "conversation" },
  ) => void;
  onAiChatRequest?: (message: string, selectedText: string) => void;
  onTocItemsChange?: (items: TableOfContentDataItem[]) => void;
  aiMode?: "assist" | "chat";
  editorRef?: RefObject<ReturnType<typeof useEditor> | null>;
  editable?: boolean;
  pageTitle?: string;
  /** Uploads images dropped/pasted into the editor. Omit to disable image upload. */
  imageUploadHandler?: EditorImageUploadHandler;
  /** Streams AI Assist completions. Omit to disable AI Assist (buttons become a no-op). */
  streamCompletion?: StreamCompletionFn;
  /**
   * Rendered above the content area, inside the editor context — pass
   * `<FixedToolbar />` here for a persistent toolbar.
   */
  toolbar?: ReactNode;
}

export const RichTextEditor = ({
  initialContent,
  contentType = "markdown",
  outputContentType = "markdown",
  onChange,
  onAiChatRequest,
  onTocItemsChange,
  aiMode,
  editorRef,
  editable = true,
  pageTitle,
  imageUploadHandler,
  streamCompletion,
  toolbar,
}: RichTextEditorProps) => {
  // Set to true before programmatic setContent calls so onUpdate can skip them.
  const isProgrammaticUpdate = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable,
    content: initialContent,
    contentType,
    editorProps: {
      attributes: {
        class:
          "tiptap-core flex-1 px-2 pt-2 pb-[10vh] md:px-12 md:pt-1 md:pb-[30vh] ",
      },
    },
    onBlur: () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          bubbles: true,
          cancelable: true,
        }),
      );
    },
    onUpdate: ({ editor, transaction }) => {
      if (!onChange) {
        return;
      }

      if (isProgrammaticUpdate.current) {
        isProgrammaticUpdate.current = false;
        return;
      }

      if (
        editor.storage.streamContentState?.isStreaming ||
        editor.storage.aiAssistState?.isStreaming
      ) {
        return;
      }

      const editSource = transaction.getMeta("editSource");
      const source: "manual" | "conversation" =
        editSource === "conversation" ? "conversation" : "manual";

      switch (outputContentType) {
        case "html":
          onChange(editor.getHTML(), { source });
          break;
        case "json":
          onChange(editor.getJSON(), { source });
          break;
        case "markdown":
          onChange(editor.getMarkdown(), { source });
          break;
        default:
          onChange(editor.getText(), { source });
      }
    },
    extensions: [
      ...createExtensions(),
      TableOfContents.configure({
        onUpdate: (items) => onTocItemsChange?.(items),
      }),
    ],
  });

  const { handleAiAssist, abortStream } = useAiAssistStream(editor, {
    pageTitle,
    streamCompletion,
  });

  useEffect(() => {
    if (editorRef && editor) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      // Pass false to suppress onUpdate — toggling editability shouldn't
      // trigger a content change event (the content hasn't changed).
      editor.setEditable(editable, false);
    }
  }, [editor, editable]);

  // Sync initialContent changes to the live editor
  const isInitialMount = useRef(true);
  useEffect(() => {
    // Skip the first render — useEditor handles initial content at creation time
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!editor || editor.storage.streamContentState?.isStreaming) {
      return;
    }

    if (contentType === "markdown" && typeof initialContent === "string") {
      if (editor.getMarkdown() === initialContent) {
        return;
      }

      const parsed = editor.markdown?.parse(initialContent);

      if (parsed) {
        const rawDoc = editor.state.schema.nodeFromJSON(parsed);
        const sanitized = sanitizeNode(rawDoc, editor.state.schema);
        isProgrammaticUpdate.current = true;
        editor.commands.setContent(sanitized.toJSON());
        clearEditorHistory(editor);
      }
    } else {
      // html or json — setContent handles these natively
      isProgrammaticUpdate.current = true;
      editor.commands.setContent(initialContent ?? "");
      clearEditorHistory(editor);
    }
  }, [editor, initialContent, contentType]);

  if (!editor) {
    return null;
  }

  const contentArea = (
    <EditorContentArea
      onAiAssist={handleAiAssist}
      onStopAiAssist={abortStream}
      onAiChatRequest={onAiChatRequest}
      aiMode={aiMode}
      imageUploadHandler={imageUploadHandler}
    />
  );

  return (
    <div className={cn(EDITOR_SCOPE_CLASS, "w-full h-full flex flex-col")}>
      <EditorContext.Provider value={{ editor }}>
        {toolbar ? (
          <>
            <div className="shrink-0 border-b border-gray-200 bg-white">
              {toolbar}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">{contentArea}</div>
          </>
        ) : (
          contentArea
        )}
      </EditorContext.Provider>
    </div>
  );
};
