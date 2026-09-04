import { mergeAttributes, Node } from "@tiptap/core";
import type { Transaction } from "@tiptap/pm/state";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ImageUploadNodeView } from "./image-upload-node-view";

export interface ImageUploadNodeAttributes {
  src: string | null;
  alt: string | null;
  uploadId: string | null;
  uploadProgress: number;
  uploadError: string | null;
}

export interface ImageUploadStorage {
  uploadImage: ((file: File) => void) | null;
  startUploadForNode: ((file: File, nodePos: number) => void) | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageUpload: {
      insertImageUpload: (attrs: { uploadId: string }) => ReturnType;
      insertImagePlaceholder: () => ReturnType;
    };
  }
}

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const isImageFile = (file: File): boolean =>
  ACCEPTED_IMAGE_TYPES.includes(file.type);

const getImageFiles = (files: FileList | File[]): File[] =>
  Array.from(files).filter(isImageFile);

const setCursorAfterNode = (tr: Transaction, posAfterNode: number) => {
  const nodeAfter = tr.doc.nodeAt(posAfterNode);
  if (nodeAfter?.isTextblock) {
    tr.setSelection(TextSelection.create(tr.doc, posAfterNode + 1));
  } else {
    const defaultType = tr.doc.type.contentMatch.defaultType;
    if (defaultType) {
      tr.insert(posAfterNode, defaultType.create());
      tr.setSelection(TextSelection.create(tr.doc, posAfterNode + 1));
    }
  }
};

export const ImageUpload = Node.create({
  name: "imageUpload",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addStorage(): ImageUploadStorage {
    return {
      uploadImage: null,
      startUploadForNode: null,
    };
  },

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

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadNodeView);
  },

  addCommands() {
    return {
      insertImageUpload:
        (attrs) =>
        ({ tr, dispatch }) => {
          const node = this.type.create(attrs);
          tr.replaceSelectionWith(node);

          const { $to } = tr.selection;
          setCursorAfterNode(tr, $to.pos);

          if (dispatch) dispatch(tr);
          return true;
        },
      insertImagePlaceholder:
        () =>
        ({ tr, dispatch }) => {
          const imageNode = this.type.create();
          const { $from } = tr.selection;
          const parent = $from.parent;
          const isEmptyBlock = parent.isTextblock && parent.content.size === 0;

          if (isEmptyBlock) {
            const blockPos = $from.before($from.depth);
            tr.replaceWith(blockPos, blockPos + parent.nodeSize, imageNode);
            setCursorAfterNode(tr, blockPos + imageNode.nodeSize);
          } else {
            const endOfBlock = $from.end($from.depth);
            tr.insert(endOfBlock + 1, imageNode);
            const posAfterImage = endOfBlock + 1 + imageNode.nodeSize;
            setCursorAfterNode(tr, posAfterImage);
          }

          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extensionThis = this;
    return [
      new Plugin({
        key: new PluginKey("imageUploadDropPaste"),
        props: {
          handleDrop(view, event) {
            if (!event.dataTransfer?.files.length) return false;
            const images = getImageFiles(Array.from(event.dataTransfer.files));
            if (!images.length) return false;

            const uploadImage = extensionThis.storage
              .uploadImage as ImageUploadStorage["uploadImage"];
            if (!uploadImage) return false;

            event.preventDefault();
            const coords = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            if (coords) {
              const resolved = view.state.doc.resolve(coords.pos);
              const tr = view.state.tr.setSelection(
                TextSelection.near(resolved),
              );
              view.dispatch(tr);
            }
            for (const file of images) {
              uploadImage(file);
            }
            return true;
          },
          handlePaste(_view, event) {
            if (!event.clipboardData?.files.length) return false;
            const images = getImageFiles(Array.from(event.clipboardData.files));
            if (!images.length) return false;

            const uploadImage = extensionThis.storage
              .uploadImage as ImageUploadStorage["uploadImage"];
            if (!uploadImage) return false;

            event.preventDefault();
            for (const file of images) {
              uploadImage(file);
            }
            return true;
          },
        },
      }),
    ];
  },
});
