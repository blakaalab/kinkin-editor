import { useState } from "react";

import { NodeSelection } from "@tiptap/pm/state";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Video } from "lucide-react";

import { useUiEditorState } from "@/editor/tiptap-cores/hooks/use-ui-editor-state";
import { EmbedLinkField } from "@/editor/tiptap-cores/ui/embed-link-field";
import { ResizableMedia } from "@/editor/tiptap-cores/ui/resizable-media";

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
      <EmbedLinkField
        icon={Video}
        placeholder="Paste a YouTube or TikTok link…"
        label="Video link"
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
