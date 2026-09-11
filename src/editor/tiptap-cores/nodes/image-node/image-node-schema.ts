import type { MarkdownTokenizer } from "@tiptap/core";
import Image from "@tiptap/extension-image";

import {
  mediaWidthAttribute,
  normalizeMediaWidth,
} from "../../lib/media-width";

/**
 * `![alt](src "title"){width=50%}` — Pandoc's link-attribute syntax, the one
 * markdown dialect that can size an image. Renderers without it show the
 * image full width with `{width=50%}` after it, which loses nothing.
 */
const SIZED_IMAGE =
  /^!\[([^\]]*)\]\(\s*(<[^>]*>|[^\s)]+)(?:\s+"([^"]*)")?\s*\)\{\s*width=(\d+(?:\.\d+)?)%\s*\}/;

/**
 * Registered under `image`, so what it produces goes to the same
 * `parseMarkdown` as a plain image. It only claims sized images; anything
 * else falls through to marked's own image rule.
 */
const sizedImageTokenizer: MarkdownTokenizer = {
  name: "image",
  level: "inline",
  start: (src) => src.indexOf("!["),
  tokenize: (src) => {
    const match = SIZED_IMAGE.exec(src);

    if (!match) {
      return undefined;
    }

    const [raw, text, href, title, width] = match;
    return {
      type: "image",
      raw,
      text,
      href: href.replace(/^<|>$/g, ""),
      title: title ?? null,
      width,
    };
  },
};

/**
 * The image node, with a `width` it can be resized to. `height` is left as
 * Tiptap defines it and never drives layout: the stylesheet keeps
 * `height: auto`, so a picture always keeps its proportions.
 */
export const ContentImage = Image.extend({
  addAttributes() {
    return { ...this.parent?.(), width: mediaWidthAttribute };
  },

  markdownTokenizer: sizedImageTokenizer,

  parseMarkdown: (token, h) =>
    h.createNode("image", {
      src: token.href,
      title: token.title,
      alt: token.text,
      width: normalizeMediaWidth(token.width),
    }),

  renderMarkdown: (node) => {
    const { src = "", alt = "", title = "" } = node.attrs ?? {};
    const width = normalizeMediaWidth(node.attrs?.width);
    const image = title
      ? `![${alt ?? ""}](${src ?? ""} "${title}")`
      : `![${alt ?? ""}](${src ?? ""})`;

    return width ? `${image}{width=${width}%}` : image;
  },
});
