import { ReactNodeViewRenderer } from "@tiptap/react";

import { ContentImage } from "./image-node-schema";
import { ImageNodeView } from "./image-node-view";

/** The shared image schema, drawn with width handles. */
export const EditorImage = ContentImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
