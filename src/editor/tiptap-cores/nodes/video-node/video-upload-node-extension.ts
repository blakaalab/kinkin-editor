import type { Editor } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { placeBlock, setCursorAfterNode } from "../../lib/tiptap-utils";
import { sanitizeVideoSrc, VideoUploadNode } from "./video-node-schema";
import { VideoUploadNodeView } from "./video-upload-node-view";

export interface EditorVideoUploadHandler {
  /** Uploads the file and resolves to the URL to play it from. Throw to fail it. */
  upload: (
    file: File,
    onProgress: (progress: number) => void,
  ) => Promise<string>;
  /** The largest file accepted, in bytes. Defaults to 100 MB. */
  maxSize?: number;
  /** The MIME types accepted. Defaults to MP4, WebM and Ogg. */
  accept?: string[];
}

export interface VideoUploadStorage {
  /** Set by `<RichTextEditor videoUploadHandler>`; `null` turns upload off. */
  handler: EditorVideoUploadHandler | null;
}

declare module "@tiptap/core" {
  interface Storage {
    videoUpload: VideoUploadStorage;
  }
}

const DEFAULT_MAX_SIZE = 100 * 1024 * 1024;

/**
 * The formats every current browser plays. QuickTime (`.mov`) is left out: it
 * uploads fine and then shows a black box wherever the codec inside is not
 * H.264. A host that transcodes can add it through `accept`.
 */
const DEFAULT_ACCEPT = ["video/mp4", "video/webm", "video/ogg"];

const formatSize = (bytes: number): string => {
  const units = ["bytes", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  // One decimal only where it says something: 1.5 GB, not 100.0 MB.
  return `${Number.isInteger(size) || size >= 10 ? Math.round(size) : size.toFixed(1)} ${units[unit]}`;
};

/** The accepted types, for a file picker's `accept`. `null` while upload is off. */
export const getAcceptedVideoTypes = (editor: Editor): string[] | null => {
  const handler = editor.storage.videoUpload?.handler;
  return handler ? (handler.accept ?? DEFAULT_ACCEPT) : null;
};

const findUploadPos = (editor: Editor, uploadId: string): number | null => {
  let found: number | null = null;

  editor.state.doc.descendants((node, pos) => {
    if (found !== null) {
      return false;
    }

    if (node.type.name === "videoUpload" && node.attrs.uploadId === uploadId) {
      found = pos;
    }

    return true;
  });

  return found;
};

/** Progress and failure are not edits: neither belongs on the undo stack. */
const updateUpload = (
  editor: Editor,
  uploadId: string,
  attrs: { uploadProgress?: number; uploadError?: string },
) => {
  const pos = findUploadPos(editor, uploadId);

  if (pos === null) {
    return;
  }

  const { tr } = editor.state;

  for (const [key, value] of Object.entries(attrs)) {
    tr.setNodeAttribute(pos, key, value);
  }

  editor.view.dispatch(tr.setMeta("addToHistory", false));
};

const finishUpload = (editor: Editor, uploadId: string, src: string) => {
  const pos = findUploadPos(editor, uploadId);
  const videoType = editor.schema.nodes.video;
  const node = pos === null ? null : editor.state.doc.nodeAt(pos);

  if (pos === null || !node || !videoType) {
    return; // Deleted mid-upload; nothing to put the video into.
  }

  editor.view.dispatch(
    editor.state.tr.replaceWith(
      pos,
      pos + node.nodeSize,
      videoType.create({ src }),
    ),
  );
};

const validate = (
  file: File,
  handler: EditorVideoUploadHandler,
): string | null => {
  const accept = handler.accept ?? DEFAULT_ACCEPT;
  const maxSize = handler.maxSize ?? DEFAULT_MAX_SIZE;

  if (!accept.includes(file.type)) {
    return "This video format isn't supported.";
  }

  if (file.size > maxSize) {
    return `This video is larger than the ${formatSize(maxSize)} limit.`;
  }

  return null;
};

/**
 * Uploads a video file into the document: into a new block at the selection,
 * or, given `replacePos`, in place of the node there (an empty embed whose
 * "Upload file" button was used).
 *
 * A file that is the wrong type or too big still gets a block — one showing
 * why — so the author is not left wondering where their video went. Returns
 * false when upload is off, or the selection cannot hold a block.
 */
export const uploadVideoFile = (
  editor: Editor,
  file: File,
  replacePos?: number,
): boolean => {
  const handler = editor.storage.videoUpload?.handler;
  const uploadType = editor.schema.nodes.videoUpload;

  if (!handler || !uploadType) {
    return false;
  }

  const uploadId = crypto.randomUUID();
  const error = validate(file, handler);
  const node = uploadType.create({
    uploadId,
    fileName: file.name,
    uploadError: error,
  });
  const { tr } = editor.state;
  let pos: number | null;

  if (replacePos === undefined) {
    pos = placeBlock(tr, node);
  } else {
    const replaced = tr.doc.nodeAt(replacePos);
    pos = replaced ? replacePos : null;

    if (replaced) {
      tr.replaceWith(replacePos, replacePos + replaced.nodeSize, node);
    }
  }

  if (pos === null) {
    return false;
  }

  setCursorAfterNode(tr, pos + node.nodeSize);
  editor.view.dispatch(tr.scrollIntoView());
  editor.commands.focus();

  if (error) {
    return true;
  }

  handler
    .upload(file, (progress) =>
      updateUpload(editor, uploadId, { uploadProgress: progress }),
    )
    .then((result) => {
      const src = sanitizeVideoSrc(result);

      if (src) {
        finishUpload(editor, uploadId, src);
      } else {
        updateUpload(editor, uploadId, {
          uploadError:
            "The upload didn't return a URL the video can play from.",
        });
      }
    })
    .catch((reason: unknown) => {
      updateUpload(editor, uploadId, {
        uploadError: reason instanceof Error ? reason.message : "Upload failed",
      });
    });

  return true;
};

const firstVideoFile = (files: FileList | undefined): File | undefined =>
  Array.from(files ?? []).find((file) => file.type.startsWith("video/"));

/** The shared placeholder schema, with the progress UI and file drop/paste. */
export const VideoUpload = VideoUploadNode.extend({
  addStorage(): VideoUploadStorage {
    return { handler: null };
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoUploadNodeView);
  },

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        key: new PluginKey("videoUploadDropPaste"),
        props: {
          handleDrop(view, event) {
            const file = firstVideoFile(event.dataTransfer?.files);

            if (!file || !editor.storage.videoUpload.handler) {
              return false;
            }

            event.preventDefault();
            const coords = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            if (coords) {
              view.dispatch(
                view.state.tr.setSelection(
                  TextSelection.near(view.state.doc.resolve(coords.pos)),
                ),
              );
            }

            return uploadVideoFile(editor, file);
          },

          handlePaste(_view, event) {
            const file = firstVideoFile(event.clipboardData?.files);

            if (!file || !editor.storage.videoUpload.handler) {
              return false;
            }

            event.preventDefault();
            return uploadVideoFile(editor, file);
          },
        },
      }),
    ];
  },
});
