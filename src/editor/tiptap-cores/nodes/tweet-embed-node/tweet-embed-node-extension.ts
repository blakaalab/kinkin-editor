import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { placeBlock, setCursorAfterNode } from "../../lib/tiptap-utils";
import { TweetEmbedNode } from "./tweet-embed-node-schema";
import { TweetEmbedNodeView } from "./tweet-embed-node-view";
import { parseTweetUrl } from "./tweet-embed-utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tweetEmbed: {
      /** Inserts an embed that asks for its link, with the caret in the field. */
      insertTweetEmbedPlaceholder: () => ReturnType;
      /** Embeds a link to a post on X. False for any other link. */
      setTweetEmbed: (options: { src: string }) => ReturnType;
    };
  }
}

/** The shared embed schema, with the link field, commands and link pasting. */
export const TweetEmbed = TweetEmbedNode.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TweetEmbedNodeView);
  },

  addCommands() {
    return {
      insertTweetEmbedPlaceholder:
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

      setTweetEmbed:
        ({ src }) =>
        ({ tr }) => {
          const post = parseTweetUrl(src);

          if (!post) {
            return false;
          }

          const node = this.type.create({ src: post.url });
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
        key: new PluginKey("tweetEmbedPaste"),
        props: {
          // A post link pasted on an empty line embeds. Anywhere else — mid
          // sentence, over a selection — it stays a link, as the author meant.
          handlePaste(view, event) {
            const text = event.clipboardData?.getData("text/plain").trim();

            if (!text || /\s/.test(text) || !parseTweetUrl(text)) {
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

            return editor.commands.setTweetEmbed({ src: text });
          },
        },
      }),
    ];
  },
});
