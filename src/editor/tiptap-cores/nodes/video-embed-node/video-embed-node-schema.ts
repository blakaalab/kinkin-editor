import {
  createAtomBlockMarkdownSpec,
  type MarkdownTokenizer,
  mergeAttributes,
  Node,
} from "@tiptap/core";

import {
  mediaWidthAttribute,
  normalizeMediaWidth,
} from "../../lib/media-width";
import {
  parseVideoUrl,
  VIDEO_EMBED_ALLOW,
  VIDEO_EMBED_REFERRER_POLICY,
} from "./video-embed-utils";

export interface VideoEmbedNodeAttributes {
  /** A canonical YouTube or TikTok link, or `null` while it is being asked for. */
  src: string | null;
}

/** Normalises a link, and turns anything that is not a supported video into `null`. */
const canonicalSrc = (value: unknown): string | null =>
  typeof value === "string" ? (parseVideoUrl(value)?.url ?? null) : null;

const markdownSpec = createAtomBlockMarkdownSpec({
  nodeName: "videoEmbed",
  requiredAttributes: ["src"],
  allowedAttributes: ["src", "width"],
});

/**
 * A block with a src that is not a video is left as the text it is, rather
 * than parsed into an embed that renders nothing.
 */
const markdownTokenizer: MarkdownTokenizer = {
  ...markdownSpec.markdownTokenizer,
  tokenize: (src, tokens, lexer) => {
    const token = markdownSpec.markdownTokenizer.tokenize(src, tokens, lexer);
    return token && canonicalSrc(token.attributes?.src) ? token : undefined;
  },
};

/**
 * An embedded YouTube or TikTok video. The document stores the link only; the
 * iframe is derived from it on every render, through `parseVideoUrl`, so saved
 * content cannot smuggle in an iframe pointing anywhere else.
 *
 * With no `src` the node is an embed still waiting for its link — the editor
 * draws a link field for it, and a rendered page draws nothing.
 *
 * Schema only: the link field, commands and paste handling live in
 * `video-embed-node-extension.ts`, which extends this.
 *
 * Markdown uses the Pandoc-style atom block Tiptap's own extensions use:
 * `:::videoEmbed {src="https://www.youtube.com/watch?v=…" width="50%"} :::`,
 * the width only when it has been resized.
 */
export const VideoEmbedNode = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) =>
          canonicalSrc(
            element.getAttribute("data-src") ?? element.getAttribute("src"),
          ),
        renderHTML: (attributes) => {
          const src = canonicalSrc(attributes.src);
          return src ? { "data-src": src } : {};
        },
      },
      width: mediaWidthAttribute,
    };
  },

  parseHTML() {
    return [
      { tag: `div[data-type="${this.name}"]` },
      // Embed code copied from YouTube or TikTok. Any other iframe is ignored.
      {
        tag: "iframe[src]",
        getAttrs: (element) =>
          canonicalSrc(element.getAttribute("src")) ? null : false,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attributes = mergeAttributes(HTMLAttributes, {
      "data-type": this.name,
    });
    const video = parseVideoUrl(node.attrs.src ?? "");

    if (!video) {
      return ["div", attributes];
    }

    return [
      "div",
      mergeAttributes(attributes, {
        "data-provider": video.provider,
        "data-orientation": video.portrait ? "portrait" : "landscape",
      }),
      [
        "iframe",
        {
          src: video.embedUrl,
          title: video.title,
          allow: VIDEO_EMBED_ALLOW,
          allowfullscreen: "true",
          loading: "lazy",
          referrerpolicy: VIDEO_EMBED_REFERRER_POLICY,
        },
      ],
    ];
  },

  markdownTokenizer,

  parseMarkdown: (token, h) =>
    h.createNode("videoEmbed", {
      src: canonicalSrc(token.attributes?.src),
      width: normalizeMediaWidth(token.attributes?.width),
    }),

  // An embed with no link yet has nothing to write down.
  renderMarkdown: (node) => {
    const width = normalizeMediaWidth(node.attrs?.width);

    return node.attrs?.src
      ? markdownSpec.renderMarkdown({
          ...node,
          attrs: { src: node.attrs.src, width: width ? `${width}%` : null },
        })
      : "";
  },
});
