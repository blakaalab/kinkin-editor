import { useEffect, useRef, useState } from "react";

import { NodeSelection } from "@tiptap/pm/state";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { AlertCircle, Upload, Video } from "lucide-react";

import { useUiEditorState } from "@/editor/tiptap-cores/hooks/use-ui-editor-state";
import { ResizableMedia } from "@/editor/tiptap-cores/ui/resizable-media";
import { cn } from "@/lib/utils";

import { setCursorAfterNode } from "../../lib/tiptap-utils";
import {
  getAcceptedVideoTypes,
  uploadVideoFile,
} from "../video-node/video-upload-node-extension";
import type { VideoEmbedNodeAttributes } from "./video-embed-node-schema";
import {
  isTiktokShortLink,
  parseVideoUrl,
  VIDEO_EMBED_ALLOW,
  VIDEO_EMBED_REFERRER_POLICY,
} from "./video-embed-utils";

const errorFor = (value: string): string =>
  isTiktokShortLink(value)
    ? "Short TikTok links can't be embedded. Open the video and copy the link from the address bar."
    : "That isn't a YouTube or TikTok video link.";

const LinkField = ({
  onSubmit,
  onLeave,
  onRemove,
  onUpload,
  acceptedTypes,
  autoFocus,
}: {
  onSubmit: (src: string) => string | null;
  onLeave: () => void;
  onRemove: () => void;
  onUpload: (file: File) => void;
  /** `null` while no upload handler is configured: no upload button then. */
  acceptedTypes: string[] | null;
  autoFocus: boolean;
}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    // The slash menu closes as the embed goes in and hands focus back to the
    // editor — in an animation frame, since the selection is not a text
    // selection. Taken now, the focus would be taken straight back. Two frames
    // rather than one: this effect can run before the menu queues its frame,
    // and a frame queued inside a frame always runs after it.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => inputRef.current?.focus());
    });
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  return (
    <form
      className={cn(
        "flex flex-col gap-2 rounded-md border border-dashed bg-background p-3",
        error ? "border-red-300" : "border-gray-500",
      )}
      onSubmit={(e) => {
        e.preventDefault();
        setError(onSubmit(value));
      }}
    >
      <div className="flex items-center gap-2">
        <Video className="size-5 shrink-0 text-placeholder" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="url"
          value={value}
          placeholder="Paste a YouTube or TikTok link…"
          aria-label="Video link"
          aria-invalid={!!error}
          className="flex-1 min-w-0 bg-transparent text-sm text-control outline-none placeholder:text-placeholder"
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onLeave();
            } else if (e.key === "Backspace" && !value) {
              e.preventDefault();
              onRemove();
            }
          }}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="shrink-0 rounded px-2.5 py-1 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:pointer-events-none disabled:opacity-50"
        >
          Embed
        </button>
        {acceptedTypes && (
          <>
            <span className="h-4 w-px shrink-0 bg-gray-300" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1 text-sm font-medium text-control transition-colors hover:bg-accent"
            >
              <Upload className="size-3.5" />
              Upload file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";

                if (file) {
                  onUpload(file);
                }
              }}
            />
          </>
        )}
      </div>
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-red-500">
          <AlertCircle className="mt-px size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
};

export const VideoEmbedNodeView = ({
  node,
  editor,
  getPos,
  deleteNode,
  selected,
}: NodeViewProps) => {
  const { src } = node.attrs as VideoEmbedNodeAttributes;
  const video = parseVideoUrl(src ?? "");
  const { isDragging } = useUiEditorState(editor);

  // Focus the field only for an embed inserted just now — the command leaves
  // it selected. One loaded with the document must not steal the caret.
  const [autoFocus] = useState(() => {
    const { selection } = editor.state;
    return selection instanceof NodeSelection && selection.from === getPos();
  });

  if (video) {
    return (
      <ResizableMedia
        node={node}
        editor={editor}
        getPos={getPos}
        selected={selected}
        data-type="videoEmbed"
        data-provider={video.provider}
        data-orientation={video.portrait ? "portrait" : "landscape"}
      >
        <iframe
          src={video.embedUrl}
          title={video.title}
          allow={VIDEO_EMBED_ALLOW}
          allowFullScreen
          loading="lazy"
          referrerPolicy={VIDEO_EMBED_REFERRER_POLICY}
          // An iframe swallows drag events, so a block dragged across the
          // video would have nowhere to drop.
          style={isDragging ? { pointerEvents: "none" } : undefined}
        />
      </ResizableMedia>
    );
  }

  // Empty on a read-only page, like the rendered document; the stylesheet
  // hides it.
  if (!editor.isEditable) {
    return <NodeViewWrapper data-type="videoEmbed" />;
  }

  const handleSubmit = (value: string): string | null => {
    const parsed = parseVideoUrl(value);
    const pos = getPos();

    if (!parsed) {
      return errorFor(value);
    }

    if (pos === undefined) {
      return null;
    }

    editor
      .chain()
      .command(({ tr }) => {
        tr.setNodeAttribute(pos, "src", parsed.url);
        setCursorAfterNode(tr, pos + node.nodeSize);
        return true;
      })
      .focus()
      .run();

    return null;
  };

  const handleLeave = () => {
    const pos = getPos();

    if (pos !== undefined) {
      editor.chain().setNodeSelection(pos).focus().run();
    }
  };

  const handleRemove = () => {
    deleteNode();
    editor.commands.focus();
  };

  const handleUpload = (file: File) => {
    const pos = getPos();

    if (pos !== undefined) {
      uploadVideoFile(editor, file, pos);
    }
  };

  return (
    <NodeViewWrapper data-type="videoEmbed">
      <LinkField
        onSubmit={handleSubmit}
        onLeave={handleLeave}
        onRemove={handleRemove}
        onUpload={handleUpload}
        acceptedTypes={getAcceptedVideoTypes(editor)}
        autoFocus={autoFocus}
      />
    </NodeViewWrapper>
  );
};
