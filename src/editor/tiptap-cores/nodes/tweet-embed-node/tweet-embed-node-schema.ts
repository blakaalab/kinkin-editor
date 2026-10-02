import {
  createAtomBlockMarkdownSpec,
  type MarkdownTokenizer,
  mergeAttributes,
  Node,
} from "@tiptap/core";

import { parseTweetUrl } from "./tweet-embed-utils";

export interface TweetEmbedNodeAttributes {
  /** A canonical link to a post on X, or `null` while it is being asked for. */
  src: string | null;
}

/** Normalises a link, and turns anything that is not a post into `null`. */
const canonicalSrc = (value: unknown): string | null =>
  typeof value === "string" ? (parseTweetUrl(value)?.url ?? null) : null;

/**
 * The post an element names: our own markup, the embed iframe, or the
 * `<blockquote class="twitter-tweet">` X hands out as embed code. That one
 * holds the post's text with its links, then a dated link to the post itself
 * — the last link, so the search runs backwards.
 */
const srcFromElement = (element: HTMLElement): string | null => {
  const own = element.getAttribute("data-src") ?? element.getAttribute("src");

  if (own) {
    return canonicalSrc(own);
  }

  const links = [...element.querySelectorAll("a[href]")].reverse();

  for (const link of links) {
    const src = canonicalSrc(link.getAttribute("href"));

    if (src) {
      return src;
    }
  }

  return null;
};

const markdownSpec = createAtomBlockMarkdownSpec({
  nodeName: "tweetEmbed",
  requiredAttributes: ["src"],
  allowedAttributes: ["src"],
});

/**
 * A block with a src that is not a post is left as the text it is, rather
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
 * An embedded post from X. The document stores the link only; the iframe is
 * derived from it on every render, through `parseTweetUrl`, so saved content
 * cannot smuggle in an iframe pointing anywhere else — and no X script ever
 * runs on the page.
 *
 * The embed sizes itself by message once loaded. The editor listens for that;
 * a rendered page needs `resizeTweetEmbeds`, or it keeps the stylesheet's
 * fixed height.
 *
 * With no `src` the node is an embed still waiting for its link — the editor
 * draws a link field for it, and a rendered page draws nothing.
 *
 * Schema only: the link field, commands and paste handling live in
 * `tweet-embed-node-extension.ts`, which extends this.
 *
 * Markdown: `:::tweetEmbed {src="https://x.com/user/status/…"} :::`.
 */
export const TweetEmbedNode = Node.create({
  name: "tweetEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: srcFromElement,
        renderHTML: (attributes) => {
          const src = canonicalSrc(attributes.src);
          return src ? { "data-src": src } : {};
        },
      },
    };
  },

  parseHTML() {
    const isPost = (element: HTMLElement) =>
      srcFromElement(element) ? null : false;

    return [
      { tag: `div[data-type="${this.name}"]` },
      // Embed code copied from X. Above the quote node, which would otherwise
      // take it as a quotation of the post's text.
      { tag: "blockquote.twitter-tweet", priority: 60, getAttrs: isPost },
      // The embed's iframe. Any other iframe is ignored.
      { tag: "iframe[src]", getAttrs: isPost },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attributes = mergeAttributes(HTMLAttributes, {
      "data-type": this.name,
    });
    const post = parseTweetUrl(node.attrs.src ?? "");

    if (!post) {
      return ["div", attributes];
    }

    return [
      "div",
      attributes,
      [
        "iframe",
        {
          src: post.embedUrl,
          title: "Post on X",
          loading: "lazy",
          scrolling: "no",
        },
      ],
    ];
  },

  markdownTokenizer,

  parseMarkdown: (token, h) =>
    h.createNode("tweetEmbed", { src: canonicalSrc(token.attributes?.src) }),

  // An embed with no link yet has nothing to write down.
  renderMarkdown: (node) =>
    node.attrs?.src
      ? markdownSpec.renderMarkdown({ ...node, attrs: { src: node.attrs.src } })
      : "",
});
