import { Extension } from "@tiptap/core";
import type { Node as PmNode } from "@tiptap/pm/model";
import { Fragment, Slice } from "@tiptap/pm/model";
import { Transform } from "@tiptap/pm/transform";
import DOMPurify from "dompurify";

import { preprocessStreamedContent } from "../lib/preprocess-streamed-content";
import { sanitizeNode } from "../lib/tiptap-utils";

export interface WriteStreamContentOptions {
  respondInline?: boolean;
  position?: number;
}

export interface StreamContentState {
  isStreaming: boolean;
  buffer: string;
  respondInline: boolean;
  originalDoc: PmNode | null;
  insertPosition: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    streamContent: {
      writeStreamContent: (
        chunk: string,
        options?: WriteStreamContentOptions,
      ) => ReturnType;
      closeStreamContent: () => ReturnType;
      errorStreamContent: (error: string) => ReturnType;
      resetStreamContent: () => ReturnType;
    };
  }

  interface Storage {
    streamContentState: StreamContentState;
  }
}

export const defaultStreamContentState: StreamContentState = {
  isStreaming: false,
  buffer: "",
  respondInline: false,
  originalDoc: null,
  insertPosition: 0,
};

let pendingScrollRaf: number | null = null;

const cancelPendingScroll = () => {
  if (pendingScrollRaf !== null) {
    cancelAnimationFrame(pendingScrollRaf);
    pendingScrollRaf = null;
  }
};

const buildTargetDoc = (
  storage: StreamContentState,
  parsedDoc: PmNode,
): PmNode => {
  const { originalDoc, insertPosition, respondInline } = storage;
  if (!originalDoc || insertPosition === 0) {
    return parsedDoc;
  }

  const transform = new Transform(originalDoc);

  if (respondInline) {
    const slice = new Slice(parsedDoc.content, 1, 0);
    transform.replace(insertPosition, insertPosition, slice);
  } else {
    transform.insert(insertPosition, parsedDoc.content);
  }

  return transform.doc;
};

export const StreamContent = Extension.create<StreamContentState>({
  name: "streamContentState",

  addStorage() {
    return { ...defaultStreamContentState };
  },

  addCommands() {
    return {
      writeStreamContent:
        (chunk: string, options?: WriteStreamContentOptions) =>
        ({ tr, dispatch, state }) => {
          if (!chunk) {
            return false;
          }

          if (!this.storage.isStreaming) {
            this.storage.isStreaming = true;
            this.storage.buffer = "";
            this.storage.respondInline = options?.respondInline ?? true;
            this.storage.originalDoc = state.doc;
            this.storage.insertPosition =
              options?.position ?? state.doc.content.size;
            this.editor.view.dom.classList.add("is-streaming");
          }

          this.storage.buffer += chunk;

          try {
            const preprocessed = DOMPurify.sanitize(
              preprocessStreamedContent(this.storage.buffer),
            );
            const parsed = this.editor.markdown?.parse(preprocessed);
            if (!parsed) {
              return false;
            }

            const rawDoc = state.schema.nodeFromJSON(parsed);
            const parsedDoc = sanitizeNode(rawDoc, state.schema);

            const targetDoc = buildTargetDoc(this.storage, parsedDoc);

            const oldContent = state.doc.content;
            const newContent = targetDoc.content;

            // Find the common prefix — top-level nodes that haven't changed.
            // Only replace from the first diverging node onward so ProseMirror
            // keeps existing DOM elements for stable blocks, eliminating flicker.
            let prefixSize = 0;
            let commonEnd = 0;
            const minChildren = Math.min(
              oldContent.childCount,
              newContent.childCount,
            );

            for (let i = 0; i < minChildren; i++) {
              if (oldContent.child(i).eq(newContent.child(i))) {
                prefixSize += oldContent.child(i).nodeSize;
                commonEnd = i + 1;
              } else {
                break;
              }
            }

            // Nothing changed — skip the dispatch entirely
            if (
              commonEnd === oldContent.childCount &&
              commonEnd === newContent.childCount
            ) {
              return true;
            }

            const tail: PmNode[] = [];
            for (let i = commonEnd; i < newContent.childCount; i++) {
              tail.push(newContent.child(i));
            }

            tr.replaceWith(
              prefixSize,
              state.doc.content.size,
              Fragment.from(tail),
            );
            tr.setMeta("addToHistory", false);
            tr.setMeta("editSource", "conversation");
            dispatch?.(tr);
          } catch (_) {
            // Skip to next chunk
          }

          if (pendingScrollRaf === null) {
            const editorView = this.editor.view;
            pendingScrollRaf = requestAnimationFrame(() => {
              pendingScrollRaf = null;
              const activeEl = document.activeElement;
              const lastChild = editorView.dom.lastElementChild;
              if (lastChild) {
                const contentBottom = lastChild.getBoundingClientRect().bottom;
                const minRequiredSpace = 80;
                const availableSpace = window.innerHeight - contentBottom;

                if (availableSpace < minRequiredSpace) {
                  const targetY = window.innerHeight - minRequiredSpace;
                  const contentAbsoluteBottom = contentBottom + window.scrollY;
                  window.scrollTo({
                    top: Math.max(0, contentAbsoluteBottom - targetY),
                    behavior: "smooth",
                  });
                }
              }
              if (activeEl && activeEl !== document.activeElement) {
                (activeEl as HTMLElement).focus({ preventScroll: true });
              }
            });
          }

          return true;
        },

      closeStreamContent:
        () =>
        ({ tr, dispatch }) => {
          if (!this.storage.isStreaming) {
            return false;
          }

          cancelPendingScroll();
          this.editor.view.dom.classList.remove("is-streaming");

          tr.setMeta("addToHistory", true);
          tr.setMeta("editSource", "conversation");
          dispatch?.(tr);

          Object.assign(this.storage, { ...defaultStreamContentState });

          return true;
        },

      errorStreamContent:
        (_: string) =>
        ({ tr, dispatch, state }) => {
          if (!this.storage.isStreaming) {
            return false;
          }

          cancelPendingScroll();
          this.editor.view.dom.classList.remove("is-streaming");

          if (this.storage.originalDoc) {
            tr.replaceWith(
              0,
              state.doc.content.size,
              this.storage.originalDoc.content,
            );
            tr.setMeta("addToHistory", false);
            dispatch?.(tr);
          }

          Object.assign(this.storage, { ...defaultStreamContentState });

          return true;
        },

      resetStreamContent: () => () => {
        cancelPendingScroll();
        this.editor.view.dom.classList.remove("is-streaming");
        Object.assign(this.storage, { ...defaultStreamContentState });
        return true;
      },
    };
  },

  onCreate() {
    this.storage = { ...defaultStreamContentState };
  },
});
