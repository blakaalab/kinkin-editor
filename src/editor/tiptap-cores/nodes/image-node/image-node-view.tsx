import type { NodeViewProps } from "@tiptap/react";

import { ResizableMedia } from "@/editor/tiptap-cores/ui/resizable-media";

export const ImageNodeView = ({
  node,
  editor,
  getPos,
  selected,
}: NodeViewProps) => {
  const { src, alt, title } = node.attrs;

  return (
    <ResizableMedia
      node={node}
      editor={editor}
      getPos={getPos}
      selected={selected}
    >
      <img
        src={src}
        alt={alt ?? ""}
        title={title ?? undefined}
        draggable={false}
      />
    </ResizableMedia>
  );
};
