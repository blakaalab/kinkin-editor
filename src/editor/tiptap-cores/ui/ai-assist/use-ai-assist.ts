import { useCallback, useEffect } from "react";

import { type Editor, useEditorState } from "@tiptap/react";

import { defaultAiAssistState } from "../../extensions/ai-assist-extension";
import {
  getCurrentNodeBoundingRect,
  getSelectionBoundingRect,
} from "../../lib/tiptap-utils";

export const useAiAssist = (editor: Editor | null) => {
  const state =
    useEditorState({
      editor,
      selector: ({ editor }) => {
        if (!editor) {
          return defaultAiAssistState;
        }

        const state = editor.storage.aiAssistState;

        if (!state) {
          console.warn(
            "Editor storage aiAssistState is not initialized. Ensure you added the AiAssist extension to your editor.",
          );
          return defaultAiAssistState;
        }

        return { ...defaultAiAssistState, ...state };
      },
    }) ?? defaultAiAssistState;

  useEffect(() => {
    if (!editor) {
      return;
    }

    const dom = editor.view.dom;

    const onPointerDown = () => {
      if (!state.isCalling && !state.isStreaming) {
        editor.commands.closeAiAssist();
      }
    };

    dom.addEventListener("pointerdown", onPointerDown, { capture: true });

    return () =>
      dom.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
  }, [editor, state.isCalling, state.isStreaming]);

  const getBoundingRect = useCallback(
    (editorInstance: Editor) => {
      const isLoading = state.isCalling || state.isStreaming;

      if (isLoading) {
        return getCurrentNodeBoundingRect(editorInstance);
      }

      if (!state.originalSelection) {
        return getSelectionBoundingRect(editorInstance);
      }

      try {
        const { from, to } = state.originalSelection;
        const endPos =
          state.aiContentNodeSize > 0 ? to + state.aiContentNodeSize : to;

        const fromPos = editorInstance.view.domAtPos(from);
        const toPos = editorInstance.view.domAtPos(endPos);

        if (fromPos.node && toPos.node) {
          const range = document.createRange();
          range.setStart(fromPos.node, fromPos.offset);
          range.setEnd(toPos.node, toPos.offset);

          const rect = range.getBoundingClientRect();
          if (rect.width > 0 || rect.height > 0) {
            return rect;
          }
        }
      } catch (_) {
        //
      }

      return getSelectionBoundingRect(editorInstance);
    },
    [
      state.isCalling,
      state.isStreaming,
      state.originalSelection,
      state.aiContentNodeSize,
    ],
  );

  return {
    state,
    getBoundingRect,
  };
};
