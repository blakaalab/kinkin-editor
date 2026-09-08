import { mergeAttributes, Node } from "@tiptap/core";

export interface ImageUploadNodeAttributes {
  src: string | null;
  alt: string | null;
  uploadId: string | null;
  uploadProgress: number;
  uploadError: string | null;
}

/**
 * The placeholder an image occupies while it uploads. A finished upload is
 * replaced by a real `image` node, so this only survives into a saved document
 * when the upload never completed — the display stylesheet hides it.
 *
 * Schema only: the upload UI, commands and drop handling live in
 * `image-upload-node-extension.ts`, which extends this. A document containing
 * the node can therefore be rendered without pulling in any of that.
 */
export const ImageUploadNode = Node.create({
  name: "imageUpload",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      uploadId: { default: null },
      uploadProgress: { default: 0 },
      uploadError: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="imageUpload"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "imageUpload" }),
    ];
  },
});
