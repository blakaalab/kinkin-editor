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

export interface VideoUploadNodeAttributes {
  uploadId: string | null;
  fileName: string | null;
  uploadProgress: number;
  uploadError: string | null;
}

/**
 * Where an uploaded video may live: the web, the host's own paths, or the
 * page's memory. `javascript:` and other schemes go — a `src` is written into
 * every rendered page, and a document is not trusted input. Whitespace and
 * quotes are percent-encoded — storage keys are often file names with spaces
 * in them — so the link also survives markdown's `{src="…"}`.
 */
export const sanitizeVideoSrc = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const src = value
    .trim()
    .replace(/[\s"]/g, (char) => encodeURIComponent(char));

  if (!src) {
    return null;
  }

  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(src)?.[1]?.toLowerCase();

  if (scheme === undefined) {
    return src; // A relative path: the host's own storage.
  }

  if (scheme === "https" || scheme === "http" || scheme === "blob") {
    return src;
  }

  return scheme === "data" && /^data:video\//i.test(src) ? src : null;
};

const markdownSpec = createAtomBlockMarkdownSpec({
  nodeName: "video",
  requiredAttributes: ["src"],
  allowedAttributes: ["src", "width"],
});

const markdownTokenizer: MarkdownTokenizer = {
  ...markdownSpec.markdownTokenizer,
  tokenize: (src, tokens, lexer) => {
    const token = markdownSpec.markdownTokenizer.tokenize(src, tokens, lexer);
    return token && sanitizeVideoSrc(token.attributes?.src) ? token : undefined;
  },
};

/** The `<video>` a node renders, or the first one inside it. */
const findVideoElement = (element: HTMLElement): HTMLElement | null =>
  element.matches("video") ? element : element.querySelector("video");

/**
 * An uploaded video file, played by the browser's own player. What the
 * document keeps is the URL the host's upload handler returned.
 *
 * The editor draws it with width handles (`video-node-extension.ts`); this
 * schema alone renders it for a page.
 *
 * Markdown: `:::video {src="https://…/clip.mp4" width="50%"} :::`, the width
 * only when it has been resized.
 */
export const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  selectable: true,
  // Left undraggable on purpose: a draggable node's element is a drag source,
  // so pressing on the player's seek bar would pick the whole block up. The
  // drag handle still moves it.
  draggable: false,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          const video = findVideoElement(element);
          return sanitizeVideoSrc(
            video?.getAttribute("src") ??
              video?.querySelector("source")?.getAttribute("src"),
          );
        },
        // Written onto the `<video>` in `renderHTML` below, not the wrapper.
        renderHTML: () => ({}),
      },
      width: mediaWidthAttribute,
    };
  },

  parseHTML() {
    return [
      { tag: `div[data-type="${this.name}"]` },
      // A bare `<video>` in pasted or imported HTML.
      {
        tag: "video",
        getAttrs: (element) => {
          const src =
            element.getAttribute("src") ??
            element.querySelector("source")?.getAttribute("src");
          return sanitizeVideoSrc(src) ? null : false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attributes = mergeAttributes(HTMLAttributes, {
      "data-type": this.name,
    });
    const src = sanitizeVideoSrc(node.attrs.src);

    if (!src) {
      return ["div", attributes];
    }

    return [
      "div",
      attributes,
      [
        "video",
        {
          src,
          controls: "true",
          playsinline: "true",
          // Enough to show the first frame and the duration; the rest waits
          // for play.
          preload: "metadata",
        },
      ],
    ];
  },

  markdownTokenizer,

  parseMarkdown: (token, h) =>
    h.createNode("video", {
      src: sanitizeVideoSrc(token.attributes?.src),
      width: normalizeMediaWidth(token.attributes?.width),
    }),

  renderMarkdown: (node) => {
    const src = sanitizeVideoSrc(node.attrs?.src);
    const width = normalizeMediaWidth(node.attrs?.width);

    return src
      ? markdownSpec.renderMarkdown({
          ...node,
          attrs: { src, width: width ? `${width}%` : null },
        })
      : "";
  },
});

/**
 * The placeholder a video occupies while it uploads. A finished upload is
 * replaced by a `video` node, so this only survives into a saved document
 * when the upload never completed — the display stylesheet hides it.
 *
 * Schema only: the progress UI, drop and paste handling live in
 * `video-upload-node-extension.ts`, which extends this.
 */
export const VideoUploadNode = Node.create({
  name: "videoUpload",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      uploadId: { default: null, rendered: false },
      fileName: { default: null, rendered: false },
      uploadProgress: { default: 0, rendered: false },
      uploadError: { default: null, rendered: false },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": this.name })];
  },
});
