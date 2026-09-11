import { ReactNodeViewRenderer } from "@tiptap/react";

import { VideoNode } from "./video-node-schema";
import { VideoNodeView } from "./video-node-view";

/** The shared video schema, drawn with width handles. */
export const EditorVideo = VideoNode.extend({
  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});
