import { useCallback, useEffect } from "react";

import { TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";

import {
  ACCEPTED_IMAGE_TYPES,
  type ImageUploadStorage,
} from "../nodes/image-node/image-upload-node-extension";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const isImageFile = (file: File): boolean =>
  ACCEPTED_IMAGE_TYPES.includes(file.type);

const findUploadNode = (editor: Editor, uploadId: string) => {
  let foundPos: number | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "imageUpload" && node.attrs.uploadId === uploadId) {
      foundPos = pos;
      return false;
    }
    return true;
  });
  return foundPos;
};

const updateUploadNodeAttrs = (
  editor: Editor,
  uploadId: string,
  attrs: Record<string, unknown>,
) => {
  const pos = findUploadNode(editor, uploadId);
  if (pos === null) return;

  const { tr } = editor.state;
  const node = tr.doc.nodeAt(pos);
  if (!node) return;

  tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs });
  tr.setMeta("addToHistory", false);
  editor.view.dispatch(tr);
};

const replaceUploadWithImage = (
  editor: Editor,
  uploadId: string,
  src: string,
) => {
  const pos = findUploadNode(editor, uploadId);
  if (pos === null) return;

  const imageNode = editor.state.schema.nodes.image;
  if (!imageNode) return;

  const { tr } = editor.state;
  const node = tr.doc.nodeAt(pos);
  if (!node) return;

  tr.replaceWith(
    pos,
    pos + node.nodeSize,
    imageNode.create({ src, alt: node.attrs.alt }),
  );
  editor.view.dispatch(tr);
};

const getUploadId = (file: File): string | undefined =>
  (file as File & { _uploadId?: string })._uploadId;

const setUploadId = (file: File, uploadId: string) => {
  (file as File & { _uploadId?: string })._uploadId = uploadId;
};

const startUploadAtPos = (
  editor: Editor,
  file: File,
  nodePos: number,
  uploadFile: (file: File) => void,
) => {
  if (!isImageFile(file)) return;
  if (file.size > MAX_IMAGE_SIZE) return;

  const uploadId = crypto.randomUUID();
  setUploadId(file, uploadId);

  const { tr } = editor.state;
  const node = tr.doc.nodeAt(nodePos);
  if (!node || node.type.name !== "imageUpload") return;

  tr.setNodeMarkup(nodePos, undefined, {
    ...node.attrs,
    uploadId,
    uploadProgress: 0,
    uploadError: null,
  });

  const posAfter = nodePos + node.nodeSize;
  const nodeAfter = tr.doc.nodeAt(posAfter);
  if (nodeAfter?.isTextblock) {
    tr.setSelection(TextSelection.create(tr.doc, posAfter + 1));
  }

  editor.view.dispatch(tr);

  uploadFile(file);
};

export interface EditorImageUploadHandler {
  upload: (
    file: File,
    onProgress: (progress: number) => void,
  ) => Promise<string>;
}

export interface UseEditorImageUploadOptions {
  handler: EditorImageUploadHandler | undefined;
}

export const useEditorImageUpload = (
  editor: Editor | null,
  options: UseEditorImageUploadOptions,
) => {
  const { handler } = options;

  const doUpload = useCallback(
    async (file: File) => {
      if (!editor || !handler) return;
      const uploadId = getUploadId(file);
      if (!uploadId) return;

      try {
        const src = await handler.upload(file, (progress) => {
          updateUploadNodeAttrs(editor, uploadId, {
            uploadProgress: progress,
          });
        });
        replaceUploadWithImage(editor, uploadId, src);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        updateUploadNodeAttrs(editor, uploadId, {
          uploadError: errorMessage,
        });
      }
    },
    [editor, handler],
  );

  const uploadImage = useCallback(
    (file: File) => {
      if (!editor || !handler) return;
      if (!isImageFile(file)) return;

      if (file.size > MAX_IMAGE_SIZE) {
        console.warn("Image exceeds 10MB limit:", file.name);
        return;
      }

      const uploadId = crypto.randomUUID();
      setUploadId(file, uploadId);

      editor.commands.insertImageUpload({ uploadId });
      doUpload(file);
    },
    [editor, handler, doUpload],
  );

  const startUploadForNode = useCallback(
    (file: File, nodePos: number) => {
      if (!editor || !handler) return;
      startUploadAtPos(editor, file, nodePos, doUpload);
    },
    [editor, handler, doUpload],
  );

  useEffect(() => {
    if (!editor) return;
    const storage = (
      editor.storage as unknown as Record<string, ImageUploadStorage>
    ).imageUpload;
    storage.uploadImage = uploadImage;
    storage.startUploadForNode = startUploadForNode;
  }, [editor, uploadImage, startUploadForNode]);
};
