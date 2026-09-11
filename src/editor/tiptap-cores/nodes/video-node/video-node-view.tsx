import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";

import { ResizableMedia } from "@/editor/tiptap-cores/ui/resizable-media";

import { sanitizeVideoSrc } from "./video-node-schema";

export const VideoNodeView = ({
  node,
  editor,
  getPos,
  selected,
}: NodeViewProps) => {
  const src = sanitizeVideoSrc(node.attrs.src);

  // Empty, like the rendered page, which hides it.
  if (!src) {
    return <NodeViewWrapper data-type="video" />;
  }

  return (
    <ResizableMedia
      node={node}
      editor={editor}
      getPos={getPos}
      selected={selected}
      data-type="video"
    >
      {/* biome-ignore lint/a11y/useMediaCaption: the author's own upload; there is no caption track to point at. */}
      <video src={src} controls playsInline preload="metadata" />
    </ResizableMedia>
  );
};
