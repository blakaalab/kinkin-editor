import { useEffect, useRef, useState } from "react";

import { NodeSelection } from "@tiptap/pm/state";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";

import { useUiEditorState } from "@/editor/tiptap-cores/hooks/use-ui-editor-state";
import { EmbedLinkField } from "@/editor/tiptap-cores/ui/embed-link-field";

import { setCursorAfterNode } from "../../lib/tiptap-utils";
import type { TweetEmbedNodeAttributes } from "./tweet-embed-node-schema";
import { parseTweetUrl, readTweetEmbedHeight } from "./tweet-embed-utils";
import { XLogo } from "./x-logo";

/** The post itself, grown to whatever height it reports once loaded. */
const TweetFrame = ({
  embedUrl,
  isDragging,
}: {
  embedUrl: string;
  isDragging: boolean;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const next = readTweetEmbedHeight(event);

      if (next !== null) {
        setHeight(next);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      title="Post on X"
      loading="lazy"
      scrolling="no"
      style={{
        height: height ? `${height}px` : undefined,
        // An iframe swallows drag events, so a block dragged across the post
        // would have nowhere to drop.
        pointerEvents: isDragging ? "none" : undefined,
      }}
    />
  );
};

export const TweetEmbedNodeView = ({
  node,
  editor,
  getPos,
  deleteNode,
}: NodeViewProps) => {
  const { src } = node.attrs as TweetEmbedNodeAttributes;
  const post = parseTweetUrl(src ?? "");
  const { isDragging } = useUiEditorState(editor);

  // Focus the field only for an embed inserted just now — the command leaves
  // it selected. One loaded with the document must not steal the caret.
  const [autoFocus] = useState(() => {
    const { selection } = editor.state;
    return selection instanceof NodeSelection && selection.from === getPos();
  });

  if (post) {
    return (
      <NodeViewWrapper data-type="tweetEmbed">
        {/* Keyed, so another post starts from the default height again. */}
        <TweetFrame
          key={post.id}
          embedUrl={post.embedUrl}
          isDragging={isDragging}
        />
      </NodeViewWrapper>
    );
  }

  // Empty on a read-only page, like the rendered document; the stylesheet
  // hides it.
  if (!editor.isEditable) {
    return <NodeViewWrapper data-type="tweetEmbed" />;
  }

  const handleSubmit = (value: string): string | null => {
    const parsed = parseTweetUrl(value);
    const pos = getPos();

    if (!parsed) {
      return "That isn't a link to a post on X.";
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

  return (
    <NodeViewWrapper data-type="tweetEmbed">
      <EmbedLinkField
        icon={XLogo}
        placeholder="Paste a link to a post on X…"
        label="Post link"
        onSubmit={handleSubmit}
        onLeave={handleLeave}
        onRemove={handleRemove}
        autoFocus={autoFocus}
      />
    </NodeViewWrapper>
  );
};
