import {
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";

import type { AnyExtension } from "@tiptap/core";
import { History } from "@tiptap/extension-history";
import {
  type TableOfContentDataItem,
  TableOfContents,
} from "@tiptap/extension-table-of-contents";
import { Typography } from "@tiptap/extension-typography";
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

import {
  CONTENT_STARTER_KIT_OPTIONS,
  createContentExtensions,
} from "@/editor/content-extensions";
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
import { EditorImage } from "@/editor/tiptap-cores/nodes/image-node/image-node-extension";
import { ImageUpload } from "@/editor/tiptap-cores/nodes/image-node/image-upload-node-extension";
import { CustomTable } from "@/editor/tiptap-cores/nodes/table-node/table-node-extension";
import { VideoEmbed } from "@/editor/tiptap-cores/nodes/video-embed-node/video-embed-node-extension";
import { EditorVideo } from "@/editor/tiptap-cores/nodes/video-node/video-node-extension";
import {
  type EditorVideoUploadHandler,
  VideoUpload,
} from "@/editor/tiptap-cores/nodes/video-node/video-upload-node-extension";
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

/**
 * The editing half of each shared schema extension: a node view, commands, a
 * keymap. Swapped in by name so the two lists stay one list — see
 * `createExtensions` below.
 */
const withEditorBehaviour = (
  extension: AnyExtension,
  onTocItemsChange?: (items: TableOfContentDataItem[]) => void,
): AnyExtension => {
  switch (extension.name) {
    case "starterKit":
      return StarterKit.configure({
        ...CONTENT_STARTER_KIT_OPTIONS,
        // History replaces StarterKit's undo/redo.
        undoRedo: false,
        dropcursor: { width: 2, color: false },
        link: { openOnClick: false },
      });
    case "table":
      return CustomTable;
    case "image":
      return EditorImage;
    case "imageUpload":
      return ImageUpload;
    case "video":
      return EditorVideo;
    case "videoEmbed":
      return VideoEmbed;
    case "videoUpload":
      return VideoUpload;
    case "tableOfContents":
      return TableOfContents.configure({
        onUpdate: (items) => onTocItemsChange?.(items),
      });
    default:
      return extension;
  }
};

/**
 * Every extension the editor runs: the shared content schema, with editing
 * behaviour attached, followed by the extensions that only make sense while
 * editing — none of which add a node, a mark or an attribute.
 *
 * The schema deliberately comes from `createContentExtensions()` rather than
 * being restated here. Static rendering uses that same list, so a node added
 * for the editor is a node a rendered document can already display.
 */
const createExtensions = (
  onTocItemsChange?: (items: TableOfContentDataItem[]) => void,
) => [
  ...createContentExtensions().map((extension) =>
    withEditorBehaviour(extension, onTocItemsChange),
  ),

  DropGuard,
  Placeholder.configure({
    // A string, not a function of position: the function runs while the next
    // state is being built, when `editor.state` is still the previous one, so
    // resolving `pos` against it throws whenever the documents differ in size.
    // The shorter hint a column shows is the column stylesheet's job.
    placeholder: "Write, type '/' for commands…",
    emptyNodeClass: "is-empty",
    // Without this the plugin only visits top-level nodes, so an empty
    // paragraph nested in a column (or a quote, or a list item) never gets a
    // placeholder. `showOnlyCurrent` still keeps it to the node the caret is in.
    includeChildren: true,
  }),
  Selection,
  Typography,
  AiAssist,
  StreamContent,
  UiState,
  KeyboardShortcuts,
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
  videoUploadHandler?: EditorVideoUploadHandler;
}

function EditorContentArea({
  onAiAssist,
  onStopAiAssist,
  onAiChatRequest,
  aiMode,
  imageUploadHandler,
  videoUploadHandler,
}: EditorContentAreaProps) {
  const { editor } = useContext(EditorContext)!;
  const { isDragging } = useUiEditorState(editor);

  useEditorImageUpload(editor, { handler: imageUploadHandler });
  useEffect(() => {
    if (editor) {
      editor.storage.videoUpload.handler = videoUploadHandler ?? null;
    }
  }, [editor, videoUploadHandler]);
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
  /**
   * Uploads video files dropped, pasted or picked from the `/video` field.
   * Omit to disable video upload; YouTube and TikTok embeds work regardless.
   */
  videoUploadHandler?: EditorVideoUploadHandler;
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
  videoUploadHandler,
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
          "tiptap-core flex-1 px-2 pt-2 pb-[10vh] md:px-20 md:pt-1 md:pb-[30vh] ",
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
    extensions: createExtensions(onTocItemsChange),
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
      videoUploadHandler={videoUploadHandler}
    />
  );

  return (
    <div className={cn(EDITOR_SCOPE_CLASS, "w-full h-full flex flex-col")}>
      <EditorContext.Provider value={{ editor }}>
        {toolbar ? (
          <>
            <div className="shrink-0 border-b border-border-subtle bg-background">
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
