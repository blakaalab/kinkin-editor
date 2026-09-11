import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { placeBlock, setCursorAfterNode } from "../../lib/tiptap-utils";
import { VideoEmbedNode } from "./video-embed-node-schema";
import { VideoEmbedNodeView } from "./video-embed-node-view";
import { parseVideoUrl } from "./video-embed-utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoEmbed: {
      /** Inserts an embed that asks for its link, with the caret in the field. */
      insertVideoEmbedPlaceholder: () => ReturnType;
      /** Embeds a YouTube or TikTok link. False for any other link. */
      setVideoEmbed: (options: { src: string }) => ReturnType;
    };
  }
}

/** The shared embed schema, with the link field, commands and link pasting. */
export const VideoEmbed = VideoEmbedNode.extend({
  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedNodeView);
  },

  addCommands() {
    return {
      insertVideoEmbedPlaceholder:
        () =>
        ({ tr }) => {
          const pos = placeBlock(tr, this.type.create());

          if (pos === null) {
            return false;
          }

          // The node view focuses its link field when it mounts selected.
          tr.setSelection(NodeSelection.create(tr.doc, pos));
          tr.scrollIntoView();
          return true;
        },

      setVideoEmbed:
        ({ src }) =>
        ({ tr }) => {
          const video = parseVideoUrl(src);

          if (!video) {
            return false;
          }

          const node = this.type.create({ src: video.url });
          const pos = placeBlock(tr, node);

          if (pos === null) {
            return false;
          }

          setCursorAfterNode(tr, pos + node.nodeSize);
          tr.scrollIntoView();
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        key: new PluginKey("videoEmbedPaste"),
        props: {
          // A video link pasted on an empty line embeds. Anywhere else — mid
          // sentence, over a selection — it stays a link, as the author meant.
          handlePaste(view, event) {
            const text = event.clipboardData?.getData("text/plain").trim();

            if (!text || /\s/.test(text) || !parseVideoUrl(text)) {
              return false;
            }

            const { selection } = view.state;
            const block = selection.$from.parent;

            if (
              !selection.empty ||
              block.type.name !== "paragraph" ||
              block.content.size > 0
            ) {
              return false;
            }

            return editor.commands.setVideoEmbed({ src: text });
          },
        },
      }),
    ];
  },
});
