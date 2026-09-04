import { Extension } from "@tiptap/core";
import { Slice } from "@tiptap/pm/model";

import { sanitizeNode } from "../lib/tiptap-utils";

export interface AiAssistAction {
  actionId: string;
  metadata?: Record<string, unknown>;
}

export interface AiAssistRequest extends AiAssistAction {
  selectedText: string;
  surroundingContext?: {
    beforeSelectedText?: string;
    afterSelectedText?: string;
  };
  rejectedResponse?: string;
}

export interface AiAssistSelection {
  from: number;
  to: number;
  text: string;
}

export interface AiAssistState {
  isOpen: boolean;
  originalSelection: AiAssistSelection | null;
  aiResponse: string;
  isCalling: boolean;
  isStreaming: boolean;
  errorMessage: string | null;
  lastRequest: AiAssistAction | null;
  aiInsertPos: number | null;
  aiContentNodeSize: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiAssistState: {
      openAiAssistMenu: () => ReturnType;
      executeAiAssistAction: (
        actionId: string,
        metadata?: Record<string, unknown>,
      ) => ReturnType;
      closeAiAssist: () => ReturnType;
      startAiAssistCalling: () => ReturnType;
      streamAiAssistContent: (text: string) => ReturnType;
      completeAiAssistStream: () => ReturnType;
      failAiAssistStream: (error: string) => ReturnType;
      acceptAiAssist: () => ReturnType;
      discardAiAssist: () => ReturnType;
      insertBelowAiAssist: () => ReturnType;
    };
  }

  interface Storage {
    aiAssistState: AiAssistState;
  }
}

export const defaultAiAssistState: AiAssistState = {
  isOpen: false,
  originalSelection: null,
  aiResponse: "",
  isCalling: false,
  isStreaming: false,
  errorMessage: null,
  lastRequest: null,
  aiInsertPos: null,
  aiContentNodeSize: 0,
};

export const AiAssist = Extension.create<AiAssistState>({
  name: "aiAssistState",

  addStorage() {
    return { ...defaultAiAssistState };
  },

  addCommands() {
    return {
      openAiAssistMenu:
        () =>
        ({ state }) => {
          // Capture fresh selection without executing any action
          const { from, to } = state.selection;
          const text = state.doc.textBetween(from, to, " ");

          this.storage.isOpen = true;
          this.storage.originalSelection = { from, to, text };
          this.storage.aiResponse = "";
          this.storage.isCalling = false;
          this.storage.isStreaming = false;
          this.storage.errorMessage = null;
          this.storage.lastRequest = null;
          this.storage.aiInsertPos = null;

          return true;
        },

      executeAiAssistAction:
        (actionId: string, metadata?: Record<string, unknown>) =>
        ({ state, tr, dispatch }) => {
          const { originalSelection: prevSelection, aiResponse: prevResponse } =
            this.storage;

          // If there's an existing AI response, clean it up and reuse the original selection
          if (prevSelection && prevResponse) {
            const { aiContentNodeSize } = this.storage;
            if (aiContentNodeSize > 0) {
              tr.delete(prevSelection.to, prevSelection.to + aiContentNodeSize);
            }
            // Only remove AI-added marks (strikethrough and highlight), preserve user formatting
            const strikeMark = state.schema.marks.strike;
            const highlightMark = state.schema.marks.highlight;
            if (strikeMark) {
              tr.removeMark(prevSelection.from, prevSelection.to, strikeMark);
            }
            if (highlightMark) {
              tr.removeMark(
                prevSelection.from,
                prevSelection.to,
                highlightMark,
              );
            }
            tr.setMeta("addToHistory", false);
            dispatch?.(tr);

            // Reuse the previous original selection, just reset response state
            this.storage.aiResponse = "";
            this.storage.isCalling = false;
            this.storage.isStreaming = false;
            this.storage.errorMessage = null;
            this.storage.lastRequest = { actionId, metadata };
            this.storage.aiInsertPos = null;
            this.storage.aiContentNodeSize = 0;

            return true;
          }

          // No existing response - execute with current selection
          // The selection should already be captured by openAiAssistMenu
          if (!prevSelection) {
            return false;
          }

          this.storage.aiResponse = "";
          this.storage.isCalling = false;
          this.storage.isStreaming = false;
          this.storage.errorMessage = null;
          this.storage.lastRequest = { actionId, metadata };
          this.storage.aiInsertPos = null;
          this.storage.aiContentNodeSize = 0;

          return true;
        },

      closeAiAssist:
        () =>
        ({ state, tr, dispatch }) => {
          const { originalSelection, aiResponse, aiContentNodeSize } =
            this.storage;

          Object.assign(this.storage, { ...defaultAiAssistState });

          if (originalSelection && aiResponse) {
            const { from, to } = originalSelection;
            if (aiContentNodeSize > 0) {
              tr.delete(to, to + aiContentNodeSize);
            }
            // Only remove AI-added marks (strikethrough and highlight), preserve user formatting
            const strikeMark = state.schema.marks.strike;
            const highlightMark = state.schema.marks.highlight;
            if (strikeMark) {
              tr.removeMark(from, to, strikeMark);
            }
            if (highlightMark) {
              tr.removeMark(from, to, highlightMark);
            }
            tr.setMeta("addToHistory", false);
            dispatch?.(tr);
          }

          return true;
        },

      startAiAssistCalling: () => () => {
        if (!this.storage.isOpen) {
          return false;
        }

        this.storage.isCalling = true;

        return true;
      },

      streamAiAssistContent: (text: string) => {
        return ({ tr, dispatch, state }) => {
          if (!text || typeof text !== "string") {
            return false;
          }

          const { originalSelection, isOpen } = this.storage;

          if (!isOpen || !originalSelection) {
            return false;
          }

          const isFirstChunk = !this.storage.isStreaming;
          const { from, to } = originalSelection;
          const strikeMark = state.schema.marks.strike;
          const highlightMark = state.schema.marks.highlight;

          this.storage.aiResponse += text;

          // TODO: extend more format
          const parsed = this.editor.markdown?.parse(this.storage.aiResponse);
          if (!parsed) {
            return false;
          }

          try {
            const rawDoc = state.schema.nodeFromJSON(parsed);
            const parsedDoc = sanitizeNode(rawDoc, state.schema);
            const prevSize = this.storage.aiContentNodeSize;

            if (isFirstChunk) {
              this.storage.isCalling = false;
              this.storage.isStreaming = true;
              this.storage.aiInsertPos = to;
              this.storage.aiContentNodeSize = 0;
            }

            if (prevSize > 0) {
              tr.delete(to, to + prevSize);
            }

            if (isFirstChunk && strikeMark) {
              tr.addMark(from, to, strikeMark.create({ aiAssist: "true" }));
            }

            const docSizeBefore = tr.doc.content.size;
            tr.insertText(" ", to);
            const slice = new Slice(parsedDoc.content, 1, 1);
            tr.replace(to + 1, to + 1, slice);
            const totalInserted = tr.doc.content.size - docSizeBefore;
            this.storage.aiContentNodeSize = totalInserted;

            const aiEnd = to + totalInserted;
            if (strikeMark) {
              tr.removeMark(to, aiEnd, strikeMark);
            }
            if (highlightMark) {
              tr.addMark(to, aiEnd, highlightMark.create({ aiAssist: "true" }));
            }

            tr.setMeta("addToHistory", false);
            dispatch?.(tr);
          } catch (_) {
            // Partial markdown may fail to parse; wait for next chunk
          }

          return true;
        };
      },

      completeAiAssistStream: () => () => {
        if (!this.storage.isOpen) {
          return false;
        }

        this.storage.isCalling = false;
        this.storage.isStreaming = false;

        return true;
      },

      failAiAssistStream: (error: string) => () => {
        if (!this.storage.isOpen) {
          return false;
        }

        this.storage.isCalling = false;
        this.storage.isStreaming = false;
        this.storage.errorMessage = error || "An error occurred";

        return true;
      },

      acceptAiAssist:
        () =>
        ({ state, tr, dispatch, view }) => {
          const { originalSelection, aiResponse, aiContentNodeSize } =
            this.storage;

          if (!originalSelection || !aiResponse) {
            return false;
          }

          const { from, to } = originalSelection;
          const responseText = aiResponse;

          Object.assign(this.storage, { ...defaultAiAssistState });

          // Phase 1: Cleanup preview styling (NOT in history)
          if (aiContentNodeSize > 0) {
            tr.delete(to, to + aiContentNodeSize);
          }
          const strikeMark = state.schema.marks.strike;
          const highlightMark = state.schema.marks.highlight;
          if (strikeMark) {
            tr.removeMark(from, to, strikeMark);
          }
          if (highlightMark) {
            tr.removeMark(from, to, highlightMark);
          }
          tr.setMeta("addToHistory", false);
          dispatch?.(tr);

          // Phase 2: Replace original with AI response inline (IN history for proper undo)
          queueMicrotask(() => {
            const replaceTr = view.state.tr;
            const json = this.editor.markdown?.parse(responseText);
            if (json) {
              const rawDoc = view.state.schema.nodeFromJSON(json);
              const parsedDoc = sanitizeNode(rawDoc, view.state.schema);
              const slice = new Slice(parsedDoc.content, 1, 1);
              replaceTr.replace(from, to, slice);
            } else {
              replaceTr.insertText(responseText, from, to);
            }
            view.dispatch(replaceTr);
          });

          return true;
        },

      discardAiAssist:
        () =>
        ({ state, tr, dispatch }) => {
          const { originalSelection, aiResponse, aiContentNodeSize } =
            this.storage;

          if (!originalSelection) {
            Object.assign(this.storage, { ...defaultAiAssistState });
            return true;
          }

          const { from, to } = originalSelection;

          if (aiResponse && aiContentNodeSize > 0) {
            tr.delete(to, to + aiContentNodeSize);
          }

          // Only remove AI-added marks (strikethrough and highlight), preserve user formatting
          const strikeMark = state.schema.marks.strike;
          const highlightMark = state.schema.marks.highlight;
          if (strikeMark) {
            tr.removeMark(from, to, strikeMark);
          }
          if (highlightMark) {
            tr.removeMark(from, to, highlightMark);
          }
          tr.setMeta("addToHistory", false);

          Object.assign(this.storage, { ...defaultAiAssistState });

          dispatch?.(tr);
          return true;
        },

      insertBelowAiAssist:
        () =>
        ({ state, tr, dispatch, view }) => {
          const { originalSelection, aiResponse, aiContentNodeSize } =
            this.storage;

          if (!originalSelection || !aiResponse) {
            return false;
          }

          const { from, to } = originalSelection;
          const responseText = aiResponse;

          Object.assign(this.storage, { ...defaultAiAssistState });

          // Phase 1: Cleanup styled content (not in history)
          if (aiContentNodeSize > 0) {
            tr.delete(to, to + aiContentNodeSize);
          }
          const strikeMark = state.schema.marks.strike;
          const highlightMark = state.schema.marks.highlight;
          if (strikeMark) {
            tr.removeMark(from, to, strikeMark);
          }
          if (highlightMark) {
            tr.removeMark(from, to, highlightMark);
          }
          tr.setMeta("addToHistory", false);
          dispatch?.(tr);

          // Phase 2: Insert parsed AI content below the original block (in history for undo)
          queueMicrotask(() => {
            const $from = view.state.doc.resolve(from);
            const nodeEnd = $from.after(1);

            const json = this.editor.markdown?.parse(responseText);
            if (json) {
              this.editor.chain().insertContentAt(nodeEnd, json).run();
            } else {
              const insertTr = view.state.tr;
              const node = $from.node(1);
              if (!node) return;

              const clonedNode = node.copy(node.content);
              insertTr.insert(nodeEnd, clonedNode);

              const nodeStart = $from.before(1);
              const replaceFrom = nodeEnd + (from - nodeStart);
              const replaceTo = nodeEnd + (to - nodeStart);
              insertTr.insertText(responseText, replaceFrom, replaceTo);
              view.dispatch(insertTr);
            }
          });

          return true;
        },
    };
  },

  onCreate() {
    this.storage = { ...defaultAiAssistState };
  },
});
